import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm  = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage   = '';
  successMessage = '';
  isSubmitting   = false;

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

    this.registerForm = this.fb.group({
      displayName:     ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) { return; }

    this.isSubmitting   = true;
    this.errorMessage   = '';
    this.successMessage = '';

    const { email, password, displayName } = this.registerForm.value;
    const error = await this.authService.register(email, password, displayName);

    if (!error) {
      this.successMessage = 'Cuenta creada. Revisa tu email para confirmarla y luego inicia sesión.';
      this.isSubmitting   = false;
      this.registerForm.reset();
    } else {
      this.errorMessage = this.mapError(error);
      this.isSubmitting = false;
    }
  }

  private mapError(msg: string): string {
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
      return 'Ya existe una cuenta con ese email.';
    }
    if (msg.toLowerCase().includes('password')) {
      return 'La contraseña no cumple los requisitos mínimos.';
    }
    return 'No se pudo crear la cuenta. Inténtalo de nuevo.';
  }

  goToLogin(): void { this.router.navigate(['/login']); }

  get regDisplayName()   { return this.registerForm.get('displayName'); }
  get regEmail()         { return this.registerForm.get('email'); }
  get regPassword()      { return this.registerForm.get('password'); }
  get regConfirmPassword(){ return this.registerForm.get('confirmPassword'); }
  get passwordsMismatch(){ return this.registerForm.hasError('passwordsMismatch') && this.regConfirmPassword?.touched; }
}
