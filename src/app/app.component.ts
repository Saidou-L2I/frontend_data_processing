import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  selectedFile: File | null = null;
  processingResult: any = null;

  options = {
    handle_missing: 'fill_mean',
    //handle_outliers: 'smart',
    normalize: false,
    norm_method: 'minmax',
    file_format: 'excel'
  };

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  processFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('handle_missing', this.options.handle_missing);
    //formData.append('handle_outliers', this.options.handle_outliers);
    formData.append('normalize', String(this.options.normalize));
    formData.append('norm_method', this.options.norm_method);
    // 🔥 👉 METTRE ICI
    formData.append('file_format', this.options.file_format);

    this.http.post('https://backend-data-processing.onrender.com/process', formData)
      .subscribe({
        next: (res: any) => {
          this.processingResult = res;

          // Sécuriser les colonnes si backend ne fournit pas directement
          if (!this.processingResult.original_analysis.columns && this.processingResult.original_analysis.shape) {
            this.processingResult.original_analysis.columns = this.processingResult.original_analysis.shape[1];
          }
          if (!this.processingResult.final_analysis.columns && this.processingResult.final_analysis.shape) {
            this.processingResult.final_analysis.columns = this.processingResult.final_analysis.shape[1];
          }
        },
        error: () => alert("Erreur serveur")
      });
  }

  downloadProcessedFile() {
  if (!this.processingResult) return;

  const filename = this.processingResult.processed_filename;

  this.http.get(
    `https://backend-data-processing.onrender.com/download/${filename}`,
    { responseType: 'blob' }
  ).subscribe(blob => {

    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadURL;
    link.download = filename; // 🔥 garde le bon nom (.csv ou .xlsx)
    link.click();

    window.URL.revokeObjectURL(downloadURL);
  });
}

  reset() {
    this.processingResult = null;
    this.selectedFile = null;
  }
}
