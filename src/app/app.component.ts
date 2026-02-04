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
    handle_outliers: 'smart',
    normalize: false,
    norm_method: 'minmax'
  };

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) { this.selectedFile = event.target.files[0]; }

  processFile() {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('handle_missing', this.options.handle_missing);
    formData.append('handle_outliers', this.options.handle_outliers);
    formData.append('normalize', String(this.options.normalize));
    formData.append('norm_method', this.options.norm_method);

    this.http.post('https://backend-data-processing.onrender.com/process', formData).subscribe({
      next: (res: any) => this.processingResult = res,
      error: () => alert("Erreur serveur")
    });
  }

  downloadProcessedFile() {
    window.location.href = `https://backend-data-processing.onrender.com/download/${this.processingResult.processed_filename}`;
  }

  reset() {
    this.processingResult = null;
    this.selectedFile = null;
  }
}