package com.medmaxpub.api.service;

import com.medmaxpub.api.dto.*;
import com.medmaxpub.api.exception.ResourceNotFoundException;
import com.medmaxpub.api.model.Article;
import com.medmaxpub.api.model.Issue;
import com.medmaxpub.api.model.Journal;
import com.medmaxpub.api.model.JournalSection;
import com.medmaxpub.api.repository.ArticleRepository;
import com.medmaxpub.api.repository.IssueRepository;
import com.medmaxpub.api.repository.JournalRepository;
import com.medmaxpub.api.repository.JournalSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class JournalService {

    private final JournalRepository journalRepository;
    private final JournalSectionRepository journalSectionRepository;
    private final IssueRepository issueRepository;
    private final ArticleRepository articleRepository;
    private final CloudinaryService cloudinaryService;

    public List<JournalSummaryResponse> getAll() {
        return journalRepository.findAll().stream()
                .sorted(Comparator.comparing(Journal::getTitle))
                .map(this::toSummary)
                .toList();
    }

    public JournalDetailsResponse getBySlug(String slug) {
        Journal journal = journalRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Journal not found"));
        return buildDetailsResponse(journal);
    }

    public JournalSummaryResponse create(JournalRequest request, MultipartFile coverImage) {
        Journal journal = Journal.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .issn(request.getIssn())
                .category(request.getCategory())
                .description(request.getDescription())
                .coverImage(cloudinaryService.upload(coverImage, "medmaxpub/journals", "image"))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        Journal savedJournal = journalRepository.save(journal);

        journalSectionRepository.save(JournalSection.builder()
                .journalId(savedJournal.getId())
                .home("<p>" + savedJournal.getDescription() + "</p>")
                .about("<p>" + savedJournal.getDescription() + "</p>")
                .aimScope("<p>Update this journal's aim and scope content from the admin panel.</p>")
                .editorialBoard("<p>Add editorial board details for this journal.</p>")
                .authorGuidelines("<p>Configure author guidelines for this journal.</p>")
                .articleInPress("<p>Article in press items will appear here.</p>")
                .updatedAt(Instant.now())
                .build());

        return toSummary(savedJournal);
    }

    public JournalSummaryResponse update(String id, JournalRequest request, MultipartFile coverImage) {
        Journal journal = getJournalEntity(id);

        if (coverImage != null && !coverImage.isEmpty()) {
            if (journal.getCoverImage() != null) {
                cloudinaryService.delete(journal.getCoverImage().getPublicId(), journal.getCoverImage().getResourceType());
            }
            journal.setCoverImage(cloudinaryService.upload(coverImage, "medmaxpub/journals", "image"));
        }

        journal.setTitle(request.getTitle());
        journal.setSlug(request.getSlug());
        journal.setIssn(request.getIssn());
        journal.setCategory(request.getCategory());
        journal.setDescription(request.getDescription());
        journal.setUpdatedAt(Instant.now());
        return toSummary(journalRepository.save(journal));
    }

    public void delete(String id) {
        Journal journal = getJournalEntity(id);
        if (journal.getCoverImage() != null) {
            cloudinaryService.delete(journal.getCoverImage().getPublicId(), journal.getCoverImage().getResourceType());
        }

        List<Issue> issues = issueRepository.findByJournalIdOrderByYearDescVolumeDescIssueNumberDesc(id);
        for (Issue issue : issues) {
            articleRepository.findByIssueId(issue.getId()).forEach(article -> {
                if (article.getPdfFile() != null) {
                    cloudinaryService.delete(article.getPdfFile().getPublicId(), article.getPdfFile().getResourceType());
                }
                articleRepository.delete(article);
            });
            issueRepository.delete(issue);
        }

        journalSectionRepository.findByJournalId(id).ifPresent(journalSectionRepository::delete);
        journalRepository.delete(journal);
    }

    public Map<String, String> getSections(String journalId) {
        return sectionMap(getSectionEntity(journalId));
    }

    public Map<String, String> updateSections(String journalId, JournalSectionRequest request) {
        JournalSection section = journalSectionRepository.findByJournalId(journalId)
                .orElseGet(() -> JournalSection.builder().journalId(journalId).build());

        section.setHome(request.getHome());
        section.setAbout(request.getAbout());
        section.setAimScope(request.getAimScope());
        section.setEditorialBoard(request.getEditorialBoard());
        section.setAuthorGuidelines(request.getAuthorGuidelines());
        section.setArticleInPress(request.getArticleInPress());
        section.setUpdatedAt(Instant.now());

        return sectionMap(journalSectionRepository.save(section));
    }

    public List<IssueResponse> getIssues(String journalId) {
        return issueRepository.findByJournalIdOrderByYearDescVolumeDescIssueNumberDesc(journalId).stream()
                .map(this::toIssueResponse)
                .toList();
    }

    public List<ArchiveYearResponse> getArchive(String journalId) {
        List<Issue> issues = issueRepository.findByJournalIdOrderByYearDescVolumeDescIssueNumberDesc(journalId);
        Map<Integer, Map<Integer, List<Issue>>> grouped = new LinkedHashMap<>();

        for (Issue issue : issues) {
            grouped
                    .computeIfAbsent(issue.getYear(), year -> new LinkedHashMap<>())
                    .computeIfAbsent(issue.getVolume(), volume -> new ArrayList<>())
                    .add(issue);
        }

        List<ArchiveYearResponse> archive = new ArrayList<>();
        for (Map.Entry<Integer, Map<Integer, List<Issue>>> yearEntry : grouped.entrySet()) {
            List<ArchiveVolumeResponse> volumes = new ArrayList<>();
            for (Map.Entry<Integer, List<Issue>> volumeEntry : yearEntry.getValue().entrySet()) {
                List<ArchiveIssueResponse> issueResponses = volumeEntry.getValue().stream()
                        .map(issue -> new ArchiveIssueResponse(
                                issue.getId(),
                                issue.getIssueNumber(),
                                articleRepository.findByIssueId(issue.getId()).stream().map(this::toArticleSummary).toList()
                        ))
                        .toList();
                volumes.add(new ArchiveVolumeResponse(volumeEntry.getKey(), issueResponses));
            }
            archive.add(new ArchiveYearResponse(yearEntry.getKey(), volumes));
        }

        return archive;
    }

    public Journal getJournalEntity(String id) {
        return journalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Journal not found"));
    }

    private JournalSection getSectionEntity(String journalId) {
        return journalSectionRepository.findByJournalId(journalId)
                .orElseThrow(() -> new ResourceNotFoundException("Journal sections not found"));
    }

    private JournalDetailsResponse buildDetailsResponse(Journal journal) {
        List<Issue> issues = issueRepository.findByJournalIdOrderByYearDescVolumeDescIssueNumberDesc(journal.getId());
        Issue currentIssueEntity = issues.stream()
                .filter(issue -> Boolean.TRUE.equals(issue.getCurrentIssue()))
                .findFirst()
                .orElse(issues.stream().findFirst().orElse(null));

        JournalSection section = journalSectionRepository.findByJournalId(journal.getId())
                .orElse(JournalSection.builder().journalId(journal.getId()).build());

        return new JournalDetailsResponse(
                journal.getId(),
                journal.getSlug(),
                journal.getTitle(),
                journal.getIssn(),
                journal.getCategory(),
                journal.getDescription(),
                journal.getCoverImage() != null ? journal.getCoverImage().getSecureUrl() : null,
                sectionMap(section),
                currentIssueEntity != null ? toIssueResponse(currentIssueEntity) : new IssueResponse(null, null, null, null, List.of()),
                getArchive(journal.getId())
        );
    }

    private Map<String, String> sectionMap(JournalSection section) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("home", section.getHome());
        map.put("about", section.getAbout());
        map.put("aim-scope", section.getAimScope());
        map.put("editorial-board", section.getEditorialBoard());
        map.put("author-guidelines", section.getAuthorGuidelines());
        map.put("article-in-press", section.getArticleInPress());
        return map;
    }

    private JournalSummaryResponse toSummary(Journal journal) {
        return new JournalSummaryResponse(
                journal.getId(),
                journal.getSlug(),
                journal.getTitle(),
                journal.getIssn(),
                journal.getCategory(),
                journal.getDescription(),
                journal.getCoverImage() != null ? journal.getCoverImage().getSecureUrl() : null
        );
    }

    private IssueResponse toIssueResponse(Issue issue) {
        List<ArticleSummaryResponse> articles = articleRepository.findByIssueId(issue.getId()).stream()
                .map(this::toArticleSummary)
                .toList();
        return new IssueResponse(issue.getId(), issue.getVolume(), issue.getIssueNumber(), issue.getYear(), articles);
    }

    private ArticleSummaryResponse toArticleSummary(Article article) {
        return new ArticleSummaryResponse(
                article.getId(),
                article.getTitle(),
                article.getAuthors(),
                article.getPdfFile() != null ? article.getPdfFile().getSecureUrl() : null
        );
    }
}
