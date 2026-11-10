package com.philosophy.init;

import com.philosophy.model.ForumCategory;
import com.philosophy.repository.ForumCategoryRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class ForumCategoryInitializer implements ApplicationRunner {

    private final ForumCategoryRepository categoryRepository;

    public ForumCategoryInitializer(ForumCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        seed("general", "综合讨论", "General", "不限主题的哲学闲谈", "Open discussion", 1);
        seed("philosophers", "哲学家", "Philosophers", "关于哲学家其人其思", "On philosophers and their thought", 2);
        seed("schools", "学派", "Schools", "流派、传统与争论", "Schools, traditions, and disputes", 3);
        seed("reading", "读书", "Reading", "书籍、文本与笔记", "Books, texts, and notes", 4);
        seed("questions", "提问", "Questions", "提出问题，等待回应", "Ask a question", 5);
    }

    private void seed(String slug, String name, String nameEn, String description, String descriptionEn, int sortOrder) {
        if (categoryRepository.findBySlug(slug).isPresent()) {
            return;
        }
        ForumCategory category = new ForumCategory();
        category.setSlug(slug);
        category.setName(name);
        category.setNameEn(nameEn);
        category.setDescription(description);
        category.setDescriptionEn(descriptionEn);
        category.setSortOrder(sortOrder);
        categoryRepository.save(category);
    }
}
