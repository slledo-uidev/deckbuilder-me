import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

export type LoginMode = 'login' | 'register';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  mode: LoginMode = 'login';

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

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

    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
  }

  // ─── Login ────────────────────────────────────────────────────────────────

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

  // ─── Register ─────────────────────────────────────────────────────────────

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) { return; }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password, displayName } = this.registerForm.value;
    const error = await this.authService.register(email, password, displayName);

    if (!error) {
      this.successMessage = 'Cuenta creada. Revisa tu email para confirmarla y luego inicia sesión.';
      this.isSubmitting = false;
      this.registerForm.reset();
    } else {
      this.errorMessage = this.mapRegisterError(error);
      this.isSubmitting = false;
    }
  }

  private mapRegisterError(msg: string): string {
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
      return 'Ya existe una cuenta con ese email.';
    }
    if (msg.toLowerCase().includes('password')) {
      return 'La contraseña no cumple los requisitos mínimos.';
    }
    return 'No se pudo crear la cuenta. Inténtalo de nuevo.';
  }

  // ─── Mode switching ───────────────────────────────────────────────────────

  switchToRegister(): void {
    this.mode = 'register';
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.reset();
  }

  switchToLogin(): void {
    this.mode = 'login';
    this.errorMessage = '';
    this.successMessage = '';
    this.registerForm.reset();
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  get regDisplayName() { return this.registerForm.get('displayName'); }
  get regEmail() { return this.registerForm.get('email'); }
  get regPassword() { return this.registerForm.get('password'); }
  get regConfirmPassword() { return this.registerForm.get('confirmPassword'); }
  get passwordsMismatch() {
    return this.registerForm.hasError('passwordsMismatch') && this.regConfirmPassword?.touched;
  }
}

