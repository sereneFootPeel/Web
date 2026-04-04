#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate split history event-card seed SQL from history/history.txt.

The source file is a hand-curated long-form narrative grouped by country and stage.
This script extracts smaller year-based event cards, removes front-loaded year titles
from summaries, and renders a Flyway-compatible SQL seed migration.
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "src" / "main" / "resources" / "history" / "history.txt"
DEFAULT_OUTPUT_PATH = ROOT / "src" / "main" / "resources" / "db" / "migration" / "V20260401_06__history_seed_full_timelines_cleanup.sql"
SEPARATOR = r"\-\--"
STAGE_PREFIX = "第"
STAGE_MARKER = "阶段："
TRAILING_PUNCTUATION = "。！？；：.!?;）)】』》】”\"'"
SKIP_LABELS = {
    "核心事件：",
    "深层矛盾：",
    "干预措施：",
    "核心事件与细节：",
    "主要行动者：",
    "关键决策与立法：",
    "社会与经济特征：",
    "转折点意义：",
    "经济特征：",
    "联邦角色：",
    "社会矛盾：",
    "特征：",
}
PREFIX_TRANSFORMS = {
    "核心人物：": "这一阶段的重要人物包括",
    "背景：": "这一阶段的背景是",
    "历史背景：": "这一阶段的背景是",
    "核心矛盾：": "这一阶段的核心矛盾在于",
    "主要矛盾：": "这一阶段的核心矛盾在于",
    "当前矛盾：": "这一阶段的核心矛盾在于",
    "思想对立：": "这一阶段的主要思想分歧在于",
    "财政后果：": "这一阶段带来的财政后果是",
    "历史意义：": "这一阶段的历史意义在于",
    "特征总结：": "",
    "范式困境：": "这一阶段面临的范式困境在于",
    "转折点：": "这一阶段的关键转折点是",
}
EXCLUDED_SECTION_LABELS = {
    "核心人物：",
    "主要行动者：",
    "深层矛盾：",
    "核心矛盾：",
    "主要矛盾：",
    "当前矛盾：",
    "思想对立：",
    "社会与经济特征：",
    "经济特征：",
    "社会矛盾：",
    "联邦角色：",
    "背景：",
    "历史背景：",
    "历史意义：",
    "转折点意义：",
    "财政后果：",
    "特征：",
    "特征总结：",
    "范式困境：",
    "评价：",
    "评价与争议：",
    "意义：",
    "转折点：",
}
INLINE_PREFIXES = tuple(sorted(set(SKIP_LABELS) | set(PREFIX_TRANSFORMS) | EXCLUDED_SECTION_LABELS, key=len, reverse=True))
LEADING_YEAR_TITLE_RE = re.compile(
    r"^(?P<year>\d{3,4})(?:\s*[-—–]\s*\d{2,4})?年(?P<month_day>\d{1,2}月(?:\d{1,2}日)?)?\s*[：:]\s*"
)
LEADING_DECADE_RE = re.compile(r"^(?P<year>\d{3,4})s(?:\s*[-—–]\s*\d{3,4}s)?[：:，,、\s]*", re.IGNORECASE)
YEAR_NUMBER_RE = re.compile(r"(?<!\d)(?P<year>\d{3,4})(?:\s*[-—–]\s*\d{2,4})?")
LEADING_TITLE_PREFIX_RE = re.compile(r"^(?P<prefix>[^：:\n]{1,40})[：:](?P<rest>.+)$")
NON_YEAR_SUFFIXES = (
    "万",
    "亿",
    "%",
    "％",
    "人",
    "名",
    "位",
    "座",
    "家",
    "个",
    "倍",
    "美元",
    "欧元",
    "英镑",
    "公里",
    "千米",
)


@dataclass(frozen=True)
class CountrySection:
    country_code: str
    name_zh: str
    name_en: str
    map_slot: str
    marker_lon: float
    marker_lat: float
    start_line_inclusive: int
    end_line_exclusive: int


@dataclass(frozen=True)
class HistoryEventSeed:
    country_code: str
    start_year: int
    summary_zh: str


@dataclass(frozen=True)
class StageBlock:
    label: str | None
    text: str
    from_bullet: bool


COUNTRY_SECTIONS: tuple[CountrySection, ...] = (
    CountrySection("RU", "俄罗斯", "Russia", "ASIA_NORTH", 105.3188, 61.5240, 1, 309),
    CountrySection("JP", "日本", "Japan", "ASIA_SOUTH", 138.2529, 36.2048, 309, 903),
    CountrySection("DE", "德国", "Germany", "EUROPE", 10.4515, 51.1657, 903, 1282),
    CountrySection("FR", "法国", "France", "EUROPE", 2.2137, 46.2276, 1282, 1580),
    CountrySection("GB", "英国", "United Kingdom", "EUROPE", -3.4360, 55.3781, 1580, 3300),
    CountrySection("US", "美国", "United States", "NA_NORTH", -95.7129, 37.0902, 3300, 10**9),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=SOURCE_PATH, help="Path to history.txt")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT_PATH, help="Path to the generated SQL migration")
    parser.add_argument("--check", action="store_true", help="Validate and print a summary without writing SQL")
    return parser.parse_args()


def is_stage_heading(line: str) -> bool:
    return line.startswith(STAGE_PREFIX) and STAGE_MARKER in line


def parse_start_year(stage_heading: str) -> int:
    match = re.search(r"（([^）]+)）", stage_heading)
    if not match:
        raise ValueError(f"Unable to parse stage year range from: {stage_heading}")
    span = match.group(1)
    year_match = re.search(r"(\d{3,4})", span)
    if not year_match:
        raise ValueError(f"Unable to find a numeric start year in: {stage_heading}")
    return int(year_match.group(1))


def normalize_line(text: str) -> str:
    return text.strip().replace("\u00a0", " ").replace("------", "——")


def ensure_terminal_punctuation(text: str) -> str:
    stripped = text.rstrip()
    if not stripped:
        return stripped
    if stripped[-1] in TRAILING_PUNCTUATION:
        return stripped
    return stripped + "。"


def merge_parts(parts: list[str]) -> str:
    out = ""
    for part in parts:
        if not out:
            out = part
            continue
        if re.search(r"[A-Za-z0-9]$", out) and re.match(r"^[A-Za-z0-9]", part):
            out += " " + part
        else:
            out += part
    return out


def extract_first_year(text: str) -> int | None:
    stripped = text.strip()
    decade_match = LEADING_DECADE_RE.match(stripped)
    if decade_match:
        return int(decade_match.group("year"))
    for match in YEAR_NUMBER_RE.finditer(stripped):
        year = int(match.group("year"))
        before = stripped[max(0, match.start() - 1):match.start()]
        after = stripped[match.end():]
        after_lstripped = after.lstrip()
        if not after_lstripped:
            continue
        if after_lstripped.startswith(NON_YEAR_SUFFIXES):
            continue
        if after_lstripped.startswith(("年", "年代", "月")):
            return year
        if after_lstripped[:1] in ")）":
            return year
        if before in "(（":
            if not after_lstripped.startswith(NON_YEAR_SUFFIXES):
                return year
    return None


def is_context_label(line: str) -> bool:
    stripped = line.strip()
    if not stripped.endswith(("：", ":")):
        return False
    if extract_first_year(stripped) is not None:
        return False
    return stripped in INLINE_PREFIXES or len(stripped) <= 18


def strip_inline_prefix(text: str) -> str:
    stripped = text.strip()
    for prefix in INLINE_PREFIXES:
        if stripped.startswith(prefix):
            return stripped[len(prefix):].strip()
    return stripped


def strip_known_leading_prefixes(text: str) -> str:
    cleaned = text.strip()
    while True:
        next_cleaned = strip_inline_prefix(cleaned)
        if next_cleaned == cleaned:
            return cleaned
        cleaned = next_cleaned


def strip_leading_year_prefix(text: str) -> str:
    return text.strip()


def rewrite_leading_title_prefix(text: str) -> str:
    cleaned = text.strip()
    while True:
        match = LEADING_TITLE_PREFIX_RE.match(cleaned)
        if not match:
            return cleaned
        prefix = match.group("prefix").strip()
        rest = strip_known_leading_prefixes(match.group("rest").lstrip())
        if not rest:
            return cleaned
        if any(ch in prefix for ch in "。！？；!?;\n"):
            return cleaned
        if re.fullmatch(r"\d{3,4}(?:\s*[-—–]\s*\d{2,4})?(?:年|年代|s)?", prefix, re.IGNORECASE):
            cleaned = rest
            continue
        return combine_context_and_detail(prefix, rest)


def combine_context_and_detail(context: str, detail: str) -> str:
    left = context.strip().rstrip("：:；;，,。!！?？")
    right = detail.strip().lstrip("：:；;，,")
    if not left:
        return right
    if not right:
        return left
    return f"{left}，{right}"


def join_detail_fragments(details: list[str]) -> str:
    cleaned_parts: list[str] = []
    for detail in details:
        normalized = normalize_summary(detail).rstrip(TRAILING_PUNCTUATION).strip()
        if normalized:
            cleaned_parts.append(normalized)
    return "，".join(cleaned_parts)


def normalize_summary(text: str) -> str:
    cleaned = strip_known_leading_prefixes(text)
    while True:
        next_cleaned = strip_leading_year_prefix(cleaned)
        if next_cleaned == cleaned:
            break
        cleaned = next_cleaned
    cleaned = rewrite_leading_title_prefix(cleaned)
    cleaned = re.sub(r"\s*\n+\s*", " ", cleaned)
    cleaned = re.sub(r"^[：:，,；;\-\s]+", "", cleaned)
    cleaned = re.sub(r"\s+([，。！？；：,.;:])", r"\1", cleaned)
    cleaned = re.sub(r"([（《“])\s+", r"\1", cleaned)
    cleaned = re.sub(r"\s+([））》”])", r"\1", cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned)
    cleaned = cleaned.strip()
    return ensure_terminal_punctuation(cleaned)


def should_skip_block(label: str | None, text: str) -> bool:
    stripped = strip_inline_prefix(text)
    if label in EXCLUDED_SECTION_LABELS:
        return True
    if any(text.strip().startswith(prefix) for prefix in EXCLUDED_SECTION_LABELS):
        return True
    if text.strip() in SKIP_LABELS:
        return True
    if not stripped:
        return True
    return False


def collect_stage_blocks(body_lines: Iterable[str]) -> list[StageBlock]:
    blocks: list[StageBlock] = []
    parts: list[str] = []
    current_label: str | None = None
    current_from_bullet = False

    def flush() -> None:
        nonlocal parts, current_from_bullet
        if not parts:
            current_from_bullet = False
            return
        merged = merge_parts(parts).strip()
        if merged:
            blocks.append(StageBlock(label=current_label, text=merged, from_bullet=current_from_bullet))
        parts = []
        current_from_bullet = False

    for raw in body_lines:
        line = normalize_line(raw)
        if not line:
            flush()
            continue
        if is_context_label(line):
            flush()
            current_label = line
            continue
        if line == "·":
            flush()
            current_from_bullet = True
            continue
        if line.startswith("·"):
            flush()
            content = line[1:].strip()
            if not content:
                current_from_bullet = True
                continue
            parts = [content]
            current_from_bullet = True
            continue
        parts.append(line)

    flush()
    return blocks


def build_event_seed(country_code: str, start_year: int, summary: str) -> HistoryEventSeed | None:
    normalized_summary = normalize_summary(summary)
    if not normalized_summary:
        return None
    return HistoryEventSeed(country_code=country_code, start_year=start_year, summary_zh=normalized_summary)


def parse_stage_events(country_code: str, stage_heading: str, body_lines: Iterable[str]) -> list[HistoryEventSeed]:
    blocks = collect_stage_blocks(body_lines)
    events: list[HistoryEventSeed] = []
    pending_context: tuple[int, str] | None = None

    idx = 0
    while idx < len(blocks):
        block = blocks[idx]
        text = strip_inline_prefix(block.text)
        if not text:
            if not block.from_bullet:
                pending_context = None
            idx += 1
            continue

        if should_skip_block(block.label, block.text):
            if not block.from_bullet:
                pending_context = None
            idx += 1
            continue

        explicit_year = extract_first_year(text)
        next_block = blocks[idx + 1] if idx + 1 < len(blocks) else None
        is_intro_context = bool(
            text.rstrip().endswith(("：", ":"))
            and next_block is not None
            and next_block.from_bullet
        )

        if is_intro_context:
            merged_details: list[str] = []
            next_idx = idx + 1
            while next_idx < len(blocks):
                detail_block = blocks[next_idx]
                if not detail_block.from_bullet:
                    break
                if detail_block.label != block.label:
                    break
                if should_skip_block(detail_block.label, detail_block.text):
                    next_idx += 1
                    continue
                detail_text = strip_inline_prefix(detail_block.text)
                if not detail_text:
                    next_idx += 1
                    continue
                if extract_first_year(detail_text) is not None:
                    break
                merged_details.append(detail_text)
                next_idx += 1

            if merged_details:
                merged_detail_text = join_detail_fragments(merged_details)
                summary_source = combine_context_and_detail(text, merged_detail_text)
                start_year = explicit_year if explicit_year is not None else (pending_context[0] if pending_context else parse_start_year(stage_heading))
                event = build_event_seed(country_code=country_code, start_year=start_year, summary=summary_source)
                if event is not None:
                    events.append(event)
                pending_context = None
                idx = next_idx
                continue

            context_year = explicit_year if explicit_year is not None else (pending_context[0] if pending_context else parse_start_year(stage_heading))
            pending_context = (context_year, normalize_summary(text).rstrip(TRAILING_PUNCTUATION))
            idx += 1
            continue

        start_year = explicit_year if explicit_year is not None else (pending_context[0] if pending_context else parse_start_year(stage_heading))
        summary_source = text
        if block.from_bullet and pending_context is not None:
            summary_source = combine_context_and_detail(pending_context[1], text)

        event = build_event_seed(country_code=country_code, start_year=start_year, summary=summary_source)
        if event is not None:
            events.append(event)

        if not block.from_bullet:
            pending_context = None
        idx += 1

    return events


def parse_country_events(all_lines: list[str], section: CountrySection) -> list[HistoryEventSeed]:
    start_idx = max(0, section.start_line_inclusive - 1)
    end_idx = min(len(all_lines), section.end_line_exclusive - 1)
    lines = all_lines[start_idx:end_idx]
    stage_indices = [idx for idx, line in enumerate(lines) if is_stage_heading(normalize_line(line))]
    events: list[HistoryEventSeed] = []

    for stage_idx in stage_indices:
        heading = normalize_line(lines[stage_idx])
        separator_idx = len(lines)
        for idx in range(stage_idx + 1, len(lines)):
            if normalize_line(lines[idx]) == SEPARATOR:
                separator_idx = idx
                break
        stage_events = parse_stage_events(section.country_code, heading, lines[stage_idx + 1 : separator_idx])
        if not stage_events:
            raise ValueError(f"Empty event list generated for {section.country_code} stage: {heading}")
        events.extend(stage_events)
    return events


def parse_events(source_path: Path) -> tuple[list[HistoryEventSeed], list[str]]:
    all_lines = source_path.read_text(encoding="utf-8").splitlines()
    diagnostics: list[str] = []
    events: list[HistoryEventSeed] = []
    for section in COUNTRY_SECTIONS:
        section_end = len(all_lines) + 1 if section.end_line_exclusive >= 10**9 else section.end_line_exclusive
        section_events = parse_country_events(all_lines, CountrySection(
            country_code=section.country_code,
            name_zh=section.name_zh,
            name_en=section.name_en,
            map_slot=section.map_slot,
            marker_lon=section.marker_lon,
            marker_lat=section.marker_lat,
            start_line_inclusive=section.start_line_inclusive,
            end_line_exclusive=section_end,
        ))
        diagnostics.append(f"{section.country_code}: {len(section_events)} events")
        events.extend(section_events)
    return events, diagnostics


def validate_events(events: list[HistoryEventSeed]) -> None:
    if not events:
        raise ValueError("No events were parsed from history.txt")
    forbidden_snippets = (
        "核心人物：",
        "核心事件：",
        "深层矛盾：",
        "主要矛盾：",
        "关键决策与立法：",
        "社会与经济特征：",
        "转折点意义：",
        "总结：",
        "整体总结：",
        "好的，",
    )
    for event in events:
        if event.start_year < -3000 or event.start_year > 3000:
            raise ValueError(f"Unreasonable start year {event.start_year} for {event.country_code}")
        if any(snippet in event.summary_zh for snippet in forbidden_snippets):
            raise ValueError(f"Unexpected heading text remained in {event.country_code} {event.start_year}")
        leading_title_match = LEADING_TITLE_PREFIX_RE.match(event.summary_zh)
        if re.match(r"^[：:]", event.summary_zh):
            raise ValueError(f"Summary still starts with a leading colon in {event.country_code} {event.start_year}")
        if leading_title_match and not any(ch in leading_title_match.group("prefix") for ch in "，,。；;！？!?()（）"):
            raise ValueError(f"Summary still starts with a title prefix in {event.country_code} {event.start_year}")
        if re.search(r"[：:](?:评价|背景|历史背景|意义|特征总结|特征|总结|整体总结)[：:]", event.summary_zh):
            raise ValueError(f"Summary still contains chained heading labels in {event.country_code} {event.start_year}")
        if "\n\n\n" in event.summary_zh:
            raise ValueError(f"Unexpected excessive blank lines in {event.country_code} {event.start_year}")
        if re.match(r"^\d{3,4}(?:年)?[：:]", event.summary_zh):
            raise ValueError(f"Summary still starts with a year title in {event.country_code} {event.start_year}")
        if "\n" in event.summary_zh:
            raise ValueError(f"Summary should be a single paragraph in {event.country_code} {event.start_year}")
        if len(event.summary_zh) < 6:
            raise ValueError(f"Summary too short for {event.country_code} {event.start_year}")


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def render_sql(events: list[HistoryEventSeed]) -> str:
    country_sql = ",\n  ".join(
        f"({sql_quote(section.country_code)}, {sql_quote(section.name_zh)}, {sql_quote(section.name_en)}, {sql_quote(section.map_slot)}, {section.marker_lon:.4f}, {section.marker_lat:.4f})"
        for section in COUNTRY_SECTIONS
    )
    managed_country_codes = ", ".join(sql_quote(section.country_code) for section in COUNTRY_SECTIONS)

    event_lines = []
    for event in events:
        event_lines.append(
            "INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)\n"
            f"SELECT c.id, {sql_quote(event.summary_zh)}, NULL, {event.start_year}\n"
            "FROM history_country c\n"
            f"WHERE c.country_code = {sql_quote(event.country_code)};"
        )

    return (
        "-- Generated from src/main/resources/history/history.txt by backend/scripts/generate_history_seed_from_txt.py\n"
        "-- This migration replaces older sample timeline entries for the managed countries with smaller year-split history event cards.\n\n"
        "INSERT INTO history_country (country_code, name_zh, name_en, map_slot, marker_lon, marker_lat)\n"
        "VALUES\n  "
        + country_sql
        + "\nON DUPLICATE KEY UPDATE\n"
        + "  name_zh = VALUES(name_zh),\n"
        + "  name_en = VALUES(name_en),\n"
        + "  map_slot = VALUES(map_slot),\n"
        + "  marker_lon = VALUES(marker_lon),\n"
        + "  marker_lat = VALUES(marker_lat);\n\n"
        + "DELETE e\n"
        + "FROM history_event e\n"
        + "JOIN history_country c ON c.id = e.country_id\n"
        + f"WHERE c.country_code IN ({managed_country_codes});\n\n"
        + "\n\n".join(event_lines)
        + "\n"
    )


def main() -> int:
    args = parse_args()
    events, diagnostics = parse_events(args.source)
    validate_events(events)

    print(f"Parsed {len(events)} events from {args.source}")
    for line in diagnostics:
        print(f"- {line}")

    if args.check:
        return 0

    sql = render_sql(events)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(sql, encoding="utf-8", newline="\n")
    print(f"Wrote migration to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

