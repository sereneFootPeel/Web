package com.philosophy.service;

import com.philosophy.model.Philosopher;
import com.philosophy.repository.CommentRepository;
import com.philosophy.repository.ContentRepository;
import com.philosophy.repository.ContentTranslationRepository;
import com.philosophy.repository.HistoryCountryRepository;
import com.philosophy.repository.HistoryEventRepository;
import com.philosophy.repository.LikeRepository;
import com.philosophy.repository.PhilosopherRepository;
import com.philosophy.repository.PhilosopherTranslationRepository;
import com.philosophy.repository.SchoolRepository;
import com.philosophy.repository.SchoolTranslationRepository;
import com.philosophy.repository.UserBlockRepository;
import com.philosophy.repository.UserContentEditRepository;
import com.philosophy.repository.UserFollowRepository;
import com.philosophy.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DataExportServicePhilosopherImageCsvTest {

    @Test
    void exportAllDataToCsvEmbedsPhilosopherImageBlobColumns() {
        UserRepository userRepository = mock(UserRepository.class);
        SchoolRepository schoolRepository = mock(SchoolRepository.class);
        PhilosopherRepository philosopherRepository = mock(PhilosopherRepository.class);
        ContentRepository contentRepository = mock(ContentRepository.class);
        CommentRepository commentRepository = mock(CommentRepository.class);
        LikeRepository likeRepository = mock(LikeRepository.class);
        UserContentEditRepository userContentEditRepository = mock(UserContentEditRepository.class);
        UserBlockRepository userBlockRepository = mock(UserBlockRepository.class);
        UserFollowRepository userFollowRepository = mock(UserFollowRepository.class);
        SchoolTranslationRepository schoolTranslationRepository = mock(SchoolTranslationRepository.class);
        ContentTranslationRepository contentTranslationRepository = mock(ContentTranslationRepository.class);
        PhilosopherTranslationRepository philosopherTranslationRepository = mock(PhilosopherTranslationRepository.class);
        HistoryCountryRepository historyCountryRepository = mock(HistoryCountryRepository.class);
        HistoryEventRepository historyEventRepository = mock(HistoryEventRepository.class);

        DataExportService service = new DataExportService(
            userRepository,
            schoolRepository,
            philosopherRepository,
            contentRepository,
            commentRepository,
            likeRepository,
            userContentEditRepository,
            userBlockRepository,
            userFollowRepository,
            schoolTranslationRepository,
            contentTranslationRepository,
            philosopherTranslationRepository,
            historyCountryRepository,
            historyEventRepository
        );

        Philosopher philosopher = new Philosopher();
        philosopher.setId(3L);
        philosopher.setName("庄子");
        philosopher.setImageContentType("image/png");
        philosopher.setImageFileName("zhuangzi.png");
        philosopher.setImageData(new byte[] {4, 5, 6});

        when(userRepository.findAll()).thenReturn(List.of());
        when(schoolRepository.findAll()).thenReturn(List.of());
        when(philosopherRepository.findAll()).thenReturn(List.of(philosopher));
        when(contentRepository.findAll()).thenReturn(List.of());
        when(commentRepository.findAll()).thenReturn(List.of());
        when(likeRepository.findAll()).thenReturn(List.of());
        when(userContentEditRepository.findAll()).thenReturn(List.of());
        when(userBlockRepository.findAll()).thenReturn(List.of());
        when(userFollowRepository.findAll()).thenReturn(List.of());
        when(historyCountryRepository.findAllByOrderByMapSlotAscIdAsc()).thenReturn(List.of());
        when(historyEventRepository.findAll()).thenReturn(List.of());
        when(schoolTranslationRepository.findAll()).thenReturn(List.of());
        when(contentTranslationRepository.findAll()).thenReturn(List.of());
        when(philosopherTranslationRepository.findAll()).thenReturn(List.of());

        String csv = service.exportAllDataToCsv();

        assertTrue(csv.contains("图片内容类型,图片文件名,图片Base64"));
        assertTrue(csv.contains("image/png"));
        assertTrue(csv.contains("zhuangzi.png"));
        assertTrue(csv.contains(Base64.getEncoder().encodeToString(new byte[] {4, 5, 6})));
    }
}

