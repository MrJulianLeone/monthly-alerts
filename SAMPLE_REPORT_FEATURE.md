# Sample MonthlyAlert Feature

This feature allows admins to upload a sample PDF report that will be displayed on the homepage for potential customers to preview.

## Features

### Admin Dashboard
- **Upload Button**: New "Upload Sample MonthlyAlert" button in the Quick Actions section
- **Current Report Display**: Shows the currently uploaded sample report with:
  - Upload date
  - View PDF button
  - Delete button
- **Upload Page**: Dedicated page at `/admin/upload-sample-report` with:
  - PDF file upload (max 10MB)
  - File validation (PDF only)
  - Automatic replacement of previous reports

### Homepage
- **Sample Report Card**: Displays in the "How It Works" section when a report is uploaded
- **Conditional Display**: Only shows when a sample report exists
- **Auto-Hide**: Automatically hidden when admin deletes the report

## Database Migration

### Option 1: Run via API (Recommended for Production)

After deploying to Vercel, visit:
```
https://monthlyalerts.com/api/migrate-sample-reports
```

You should see:
```json
{
  "success": true,
  "message": "Migration completed successfully. Sample reports table created."
}
```

### Option 2: Run via Command Line

```bash
# Using psql
psql "$DATABASE_URL" -f scripts/012_create_sample_reports_table.sql
```

## How to Use

### Upload a Sample Report

1. Log in as admin
2. Go to Admin Dashboard
3. Click "Upload Sample MonthlyAlert" button
4. Select a PDF file (max 10MB)
5. Click "Upload Sample Report"
6. Report will appear on admin dashboard and homepage

### View Sample Report

- **Admin**: Click "View PDF" button on admin dashboard
- **Public**: Visit homepage and scroll to "How It Works" section

### Delete Sample Report

1. Go to Admin Dashboard
2. Find the "Current Sample MonthlyAlert" card
3. Click "Delete Report" button
4. Report will be removed from filesystem and database
5. Homepage link will automatically disappear

## Technical Details

### File Storage
- PDFs stored in `/public/uploads/` directory
- Filenames formatted as: `sample-monthly-alert-{timestamp}.pdf`
- Accessible via public URL: `/uploads/{filename}`

### Database Schema
```sql
CREATE TABLE sample_reports (
  id UUID PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

### Validation
- File type: PDF only (`application/pdf`)
- File size: Max 10MB
- Replaces existing reports automatically
- Admin-only access

### Server Actions
- `uploadSampleReport()`: Handles PDF upload
- `deleteSampleReport()`: Removes PDF from filesystem and database
- `getCurrentSampleReport()`: Fetches latest report for display

## Files Modified/Created

### New Files
- `app/actions/sample-report.ts` - Server actions
- `app/admin/upload-sample-report/page.tsx` - Upload page
- `app/admin/upload-sample-report/upload-sample-report-form.tsx` - Upload form
- `app/api/migrate-sample-reports/route.ts` - Migration API
- `scripts/012_create_sample_reports_table.sql` - SQL migration

### Modified Files
- `app/admin/page.tsx` - Added upload button and report display
- `app/page.tsx` - Added sample report link in "How It Works" section

## Security

- Admin-only upload/delete functionality
- File type and size validation
- Secure file storage in public directory
- Foreign key constraint ensures data integrity
- Automatic cleanup on admin user deletion

