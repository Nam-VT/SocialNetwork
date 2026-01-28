package nvt.socialnetwork.user.Service;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.user.DTO.Response.ReportResponse;
import nvt.socialnetwork.user.Entity.Report;
import nvt.socialnetwork.user.Entity.User;
import nvt.socialnetwork.user.Repository.ReportRepo;
import nvt.socialnetwork.user.Repository.UserRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepo reportRepo;
    private final UserRepo userRepo;

    public Page<ReportResponse> getAllReports(String status, Pageable pageable) {
        Page<Report> reports;
        if (status != null && !status.isEmpty()) {
            reports = reportRepo.findByStatus(status, pageable);
        } else {
            reports = reportRepo.findAll(pageable);
        }
        return reports.map(this::mapToResponse);
    }

    @Transactional
    public void createReport(String reporterId, nvt.socialnetwork.user.DTO.Request.ReportRequest request) {
        Report report = Report.builder()
                .id(UUID.randomUUID().toString())
                .reporterId(reporterId)
                .targetId(request.getTargetId())
                .targetType(request.getTargetType())
                .reason(request.getReason())
                .status("PENDING")
                .createdAt(java.time.LocalDateTime.now())
                .build();
        reportRepo.save(report);
    }

    @Transactional
    public void resolveReport(String reportId) {
        Report report = reportRepo.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus("RESOLVED");
        reportRepo.save(report);
    }

    @Transactional
    public void rejectReport(String reportId) {
        Report report = reportRepo.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus("REJECTED");
        reportRepo.save(report);
    }

    private ReportResponse mapToResponse(Report report) {
        User reporter = userRepo.findById(report.getReporterId()).orElse(null);
        String reporterName = reporter != null ? reporter.getDisplayName() : "Unknown";

        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporterId())
                .reporterName(reporterName)
                .targetId(report.getTargetId())
                .targetType(report.getTargetType())
                .reason(report.getReason())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }

    // Optional: Method to create report (if needed later)
    // public void createReport(...) { ... }

    public java.util.Map<String, Object> getAdminStats() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("pendingReports", reportRepo.countByStatus("PENDING"));
        return stats;
    }
}
