package com.philosophy.service;

import com.philosophy.model.Philosopher;
import com.philosophy.model.User;
import com.philosophy.repository.ContentRepository;
import com.philosophy.repository.PhilosopherRepository;
import com.philosophy.repository.PhilosopherTranslationRepository;
import com.philosophy.repository.UserContentEditRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PhilosopherServiceImageStorageTest {

    @Test
    void savePhilosopherForAdminClearsExistingImageWhenExplicitlyRequested() {
        PhilosopherRepository philosopherRepository = mock(PhilosopherRepository.class);
        ContentRepository contentRepository = mock(ContentRepository.class);
        UserContentEditRepository userContentEditRepository = mock(UserContentEditRepository.class);
        PhilosopherTranslationRepository philosopherTranslationRepository = mock(PhilosopherTranslationRepository.class);
        PhilosopherService service = new PhilosopherService(
            philosopherRepository,
            contentRepository,
            userContentEditRepository,
            philosopherTranslationRepository
        );

        Philosopher existing = new Philosopher();
        existing.setId(5L);
        existing.setName("柏拉图");
        existing.setImageData(new byte[] {1, 2, 3});
        existing.setImageContentType("image/png");
        existing.setImageFileName("plato.png");

        Philosopher incoming = new Philosopher();
        incoming.setId(5L);
        incoming.setName("柏拉图");
        incoming.setClearImageRequested(true);

        User editor = new User();
        editor.setId(99L);

        when(philosopherRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(philosopherRepository.save(any(Philosopher.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Philosopher saved = service.savePhilosopherForAdmin(incoming, editor);

        assertSame(existing, saved);
        assertFalse(saved.hasImage());
        assertNull(saved.getImageData());
        assertNull(saved.getImageContentType());
        assertNull(saved.getImageFileName());
    }

    @Test
    void storeImageOverwritesExistingImageDataAndMetadata() throws IOException {
        PhilosopherRepository philosopherRepository = mock(PhilosopherRepository.class);
        ContentRepository contentRepository = mock(ContentRepository.class);
        UserContentEditRepository userContentEditRepository = mock(UserContentEditRepository.class);
        PhilosopherTranslationRepository philosopherTranslationRepository = mock(PhilosopherTranslationRepository.class);
        PhilosopherService service = new PhilosopherService(
            philosopherRepository,
            contentRepository,
            userContentEditRepository,
            philosopherTranslationRepository
        );

        Philosopher philosopher = new Philosopher();
        philosopher.setId(11L);
        philosopher.setImageData(new byte[] {1, 2, 3});
        philosopher.setImageContentType("image/jpeg");
        philosopher.setImageFileName("old.jpg");

        MockMultipartFile imageFile = new MockMultipartFile(
            "imageFile",
            "mencius.png",
            "image/png",
            new byte[] {7, 8, 9}
        );

        service.storeImage(philosopher, imageFile);

        assertArrayEquals(new byte[] {7, 8, 9}, philosopher.getImageData());
        assertEquals("image/png", philosopher.getImageContentType());
        assertEquals("mencius.png", philosopher.getImageFileName());
    }
}

