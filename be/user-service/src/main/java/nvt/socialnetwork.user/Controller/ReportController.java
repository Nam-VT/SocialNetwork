package nvt.socialnetwork.user.controller;

import lombok.RequiredArgsConstructor;
import nvt.socialnetwork.user.DTO.Response.ReportResponse;
import nvt.socialnetwork.user.Service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
public class ReportController {

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> getAdminStats() {
        return ResponseEntity.ok(reportService.getAdminStats());
    }

    private final ReportService reportService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReportResponse>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity
                .ok(reportService.getAllReports(status, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PostMapping
    public ResponseEntity<Void> createReport(@RequestBody nvt.socialnetwork.user.DTO.Request.ReportRequest request,
            org.springframework.security.core.Authentication authentication) {
        reportService.createReport(authentication.getName(), request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resolveReport(@PathVariable String id) {
        reportService.resolveReport(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectReport(@PathVariable String id) {
        reportService.rejectReport(id);
        return ResponseEntity.ok().build();
    }
}
