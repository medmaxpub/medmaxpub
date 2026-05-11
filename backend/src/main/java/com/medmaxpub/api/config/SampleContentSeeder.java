package com.medmaxpub.api.config;

import com.medmaxpub.api.model.*;
import com.medmaxpub.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SampleContentSeeder implements CommandLineRunner {

    private final JournalRepository journalRepository;
    private final JournalSectionRepository journalSectionRepository;
    private final IssueRepository issueRepository;
    private final ArticleRepository articleRepository;
    private final PptResourceRepository pptResourceRepository;
    private final VideoResourceRepository videoResourceRepository;
    private final TestimonialRepository testimonialRepository;
    private final ManualScriptRepository manualScriptRepository;

    @Override
    public void run(String... args) {
        if (journalRepository.count() > 0) {
            return;
        }

        Journal oncologyJournal = journalRepository.save(Journal.builder()
                .title("Cancer Research: Open Access")
                .slug("cancer-research-open-access")
                .issn("ISSN 2999-1001")
                .category("Oncology")
                .description("An open access journal for oncology research, translational studies and clinical discussion.")
                .coverImage(FileAsset.builder().secureUrl("https://placehold.co/600x800/0f2743/ffffff?text=Cancer+Research").resourceType("image").build())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());

        journalSectionRepository.save(JournalSection.builder()
                .journalId(oncologyJournal.getId())
                .home("<p>Cancer Research: Open Access provides a modern publishing home for oncology-focused research and commentary.</p>")
                .about("<p>The journal accepts original research, reviews, case reports and editorials in cancer science and therapeutics.</p>")
                .aimScope("<ul><li>Clinical oncology</li><li>Precision medicine</li><li>Translational cancer biology</li></ul>")
                .editorialBoard("<p>Editorial board records can be updated from the admin portal per journal.</p>")
                .authorGuidelines("<ul><li>PDF or DOCX submission</li><li>Structured abstract for research papers</li><li>Corresponding author details required</li></ul>")
                .articleInPress("<p>Accepted papers awaiting assignment are shown here.</p>")
                .updatedAt(Instant.now())
                .build());

        Issue oncologyIssue = issueRepository.save(Issue.builder()
                .journalId(oncologyJournal.getId())
                .volume(5)
                .issueNumber(2)
                .year(2026)
                .currentIssue(true)
                .publishedAt(Instant.now())
                .build());

        articleRepository.saveAll(List.of(
                Article.builder()
                        .journalId(oncologyJournal.getId())
                        .issueId(oncologyIssue.getId())
                        .title("Precision Publishing Workflows for Oncology Journals")
                        .authors(List.of("Alicia Carter", "Samuel Reed"))
                        .articleType("Research Article")
                        .abstractText("A sample seeded article for current issue display.")
                        .inPress(false)
                        .pdfFile(FileAsset.builder().secureUrl("https://example.com/article-1.pdf").resourceType("raw").build())
                        .publishedAt(Instant.now())
                        .build(),
                Article.builder()
                        .journalId(oncologyJournal.getId())
                        .issueId(oncologyIssue.getId())
                        .title("Reviewer Coordination for High-Volume Open Access Titles")
                        .authors(List.of("Monica Alvarez", "Ibrahim Khan"))
                        .articleType("Review Article")
                        .abstractText("A sample seeded article for archive and issue rendering.")
                        .inPress(false)
                        .pdfFile(FileAsset.builder().secureUrl("https://example.com/article-2.pdf").resourceType("raw").build())
                        .publishedAt(Instant.now())
                        .build()
        ));

        Journal neurologyJournal = journalRepository.save(Journal.builder()
                .title("Journal of Clinical Neurology & Research")
                .slug("journal-clinical-neurology-research")
                .issn("ISSN 2999-1004")
                .category("Neurology")
                .description("A journal for evidence-based neurology, neurorehabilitation and related clinical sciences.")
                .coverImage(FileAsset.builder().secureUrl("https://placehold.co/600x800/1d3557/ffffff?text=Neurology").resourceType("image").build())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());

        journalSectionRepository.save(JournalSection.builder()
                .journalId(neurologyJournal.getId())
                .home("<p>Journal of Clinical Neurology & Research is seeded with sample section content to make first-run previews meaningful.</p>")
                .about("<p>The journal publishes clinical neurology research, reviews and cases.</p>")
                .aimScope("<ul><li>Neuroimaging</li><li>Neurorehabilitation</li><li>Clinical neuroscience</li></ul>")
                .editorialBoard("<p>Add journal-specific editor profiles here.</p>")
                .authorGuidelines("<p>Use the admin dashboard to maintain detailed author instructions.</p>")
                .articleInPress("<p>Articles in press will appear when marked before issue assignment.</p>")
                .updatedAt(Instant.now())
                .build());

        Issue neurologyIssue = issueRepository.save(Issue.builder()
                .journalId(neurologyJournal.getId())
                .volume(4)
                .issueNumber(1)
                .year(2025)
                .currentIssue(true)
                .publishedAt(Instant.now())
                .build());

        articleRepository.save(Article.builder()
                .journalId(neurologyJournal.getId())
                .issueId(neurologyIssue.getId())
                .title("Neural Recovery Metrics in Collaborative Clinical Publishing")
                .authors(List.of("Priya Deshmukh"))
                .articleType("Case Study")
                .abstractText("Seeded for archive navigation and issue browsing.")
                .inPress(false)
                .pdfFile(FileAsset.builder().secureUrl("https://example.com/archive-1.pdf").resourceType("raw").build())
                .publishedAt(Instant.now())
                .build());

        pptResourceRepository.saveAll(List.of(
                PptResource.builder()
                        .title("Advanced Case Report Presentation")
                        .description("A downloadable deck with optional preview support.")
                        .pptFile(FileAsset.builder().secureUrl("https://example.com/presentation-1.pptx").resourceType("raw").build())
                        .pdfPreviewFile(FileAsset.builder().secureUrl("https://example.com/presentation-1.pdf").resourceType("raw").build())
                        .uploadedDate(Instant.now())
                        .build(),
                PptResource.builder()
                        .title("Immunology Research Highlights")
                        .description("Sample PPT record for public listing.")
                        .pptFile(FileAsset.builder().secureUrl("https://example.com/presentation-2.pptx").resourceType("raw").build())
                        .uploadedDate(Instant.now())
                        .build()
        ));

        videoResourceRepository.saveAll(List.of(
                VideoResource.builder()
                        .title("Editorial Desk Overview")
                        .description("Sample embedded video record.")
                        .youtubeUrl("https://www.youtube.com/embed/ysz5S6PUM-U")
                        .thumbnailFile(FileAsset.builder().secureUrl("https://placehold.co/800x450/0f2743/ffffff?text=Editorial+Desk").resourceType("image").build())
                        .createdAt(Instant.now())
                        .build(),
                VideoResource.builder()
                        .title("Editorial Media Workflow Overview")
                        .description("Sample uploaded video record.")
                        .videoFile(FileAsset.builder().secureUrl("https://res.cloudinary.com/demo/video/upload/dog.mp4").resourceType("video").build())
                        .thumbnailFile(FileAsset.builder().secureUrl("https://placehold.co/800x450/0e7490/ffffff?text=Author+Workflow").resourceType("image").build())
                        .createdAt(Instant.now())
                        .build()
        ));

        testimonialRepository.saveAll(List.of(
                Testimonial.builder().name("Dr. Hannah Morris").role("Research Author").message("The platform balances a classic journal structure with a cleaner editorial workflow.").createdAt(Instant.now()).build(),
                Testimonial.builder().name("Prof. Daniel Rivera").role("Editorial Board Member").message("Issue management and archive publishing feel much more organized here.").createdAt(Instant.now()).build()
        ));

        manualScriptRepository.saveAll(List.of(
                ManualScript.builder()
                        .title("Editorial Workflow Manual")
                        .category("Operations")
                        .description("Sample downloadable manual.")
                        .file(FileAsset.builder().secureUrl("https://example.com/editorial-workflow-manual.pdf").resourceType("raw").build())
                        .createdAt(Instant.now())
                        .build(),
                ManualScript.builder()
                        .title("Author Submission Checklist")
                        .category("Author Support")
                        .description("Sample checklist asset.")
                        .file(FileAsset.builder().secureUrl("https://example.com/author-checklist.pdf").resourceType("raw").build())
                        .createdAt(Instant.now())
                        .build()
        ));
    }
}
