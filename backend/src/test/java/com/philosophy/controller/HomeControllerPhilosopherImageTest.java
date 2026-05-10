package com.philosophy.controller;

import com.philosophy.model.Philosopher;
import com.philosophy.service.CommentService;
import com.philosophy.service.ContentService;
import com.philosophy.service.LikeService;
import com.philosophy.service.PhilosopherService;
import com.philosophy.service.SchoolService;
import com.philosophy.service.TranslationService;
import com.philosophy.service.UserService;
import com.philosophy.util.LanguageUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HomeControllerPhilosopherImageTest {

	@Mock
	private PhilosopherService philosopherService;
	@Mock
	private SchoolService schoolService;
	@Mock
	private CommentService commentService;
	@Mock
	private TranslationService translationService;
	@Mock
	private ContentService contentService;
	@Mock
	private LikeService likeService;
	@Mock
	private UserService userService;
	@Mock
	private LanguageUtil languageUtil;

	private HomeController controller;

	@BeforeEach
	void setUp() {
		controller = new HomeController(
			philosopherService,
			schoolService,
			commentService,
			translationService,
			contentService,
			likeService,
			userService,
			languageUtil
		);
	}

	@Test
	void getPhilosopherImageReturnsStoredBlobWithContentType() {
		Philosopher philosopher = new Philosopher();
		philosopher.setId(8L);
		philosopher.setImageData(new byte[] {10, 20, 30});
		philosopher.setImageContentType("image/webp");
		philosopher.setImageFileName("laozi.webp");

		when(philosopherService.getPhilosopherById(8L)).thenReturn(philosopher);
		when(philosopherService.hasStoredImage(philosopher)).thenReturn(true);

		ResponseEntity<byte[]> response = controller.getPhilosopherImage(8L);

		assertEquals(200, response.getStatusCode().value());
		assertEquals("image/webp", response.getHeaders().getContentType() != null ? response.getHeaders().getContentType().toString() : null);
		assertEquals("inline; filename=\"laozi.webp\"", response.getHeaders().getFirst("Content-Disposition"));
		assertNotNull(response.getBody());
		assertArrayEquals(new byte[] {10, 20, 30}, response.getBody());
	}

	@Test
	void getPhilosopherDataReturnsImageVersionForCacheBusting() {
		Philosopher philosopher = new Philosopher();
		philosopher.setId(8L);
		philosopher.setName("老子");
		philosopher.setBio("道家代表人物");
		philosopher.setImageData(new byte[] {10, 20, 30});
		philosopher.setImageContentType("image/webp");
		philosopher.setImageFileName("laozi.webp");
		philosopher.setUpdatedAt(LocalDateTime.of(2026, 5, 10, 16, 30, 0));

		when(philosopherService.getPhilosopherById(8L)).thenReturn(philosopher);
		when(philosopherService.hasStoredImage(philosopher)).thenReturn(true);
		when(languageUtil.getLanguage(null)).thenReturn("zh");
		when(philosopherService.getContentsByPhilosopherIdWithPriorityPaged(8L, 0, 12)).thenReturn(Map.of(
			"contents", List.of(),
			"hasMore", false,
			"totalElements", 0L
		));
		when(translationService.getPhilosopherDisplayName(philosopher, "zh")).thenReturn("老子");
		when(translationService.getPhilosopherDisplayBiography(philosopher, "zh")).thenReturn("道家代表人物");

		ResponseEntity<Map<String, Object>> response = controller.getPhilosopherData(8L, null, null);

		assertEquals(200, response.getStatusCode().value());
		assertNotNull(response.getBody());
		@SuppressWarnings("unchecked")
		Map<String, Object> philosopherBody = (Map<String, Object>) response.getBody().get("philosopher");
		assertNotNull(philosopherBody);
		assertEquals("/api/philosophers/8/image", philosopherBody.get("imageUrl"));
		assertEquals("2026-05-10T16:30", philosopherBody.get("imageVersion"));
	}
}

