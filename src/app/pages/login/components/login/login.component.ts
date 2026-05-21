import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';
  isSubmitting  = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/gallery']);
      return;
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) { return; }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { username: email, password } = this.loginForm.value;
    const error = await this.authService.login(email, password);

    if (!error) {
      this.router.navigate(['/gallery']);
    } else {
      this.errorMessage = 'Email o contraseña incorrectos';
      this.isSubmitting = false;
    }
  }

  goToRegister(): void { this.router.navigate(['/register']); }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}
