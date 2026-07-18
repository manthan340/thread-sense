import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type MessageDialogType = 'success' | 'error' | 'warning' | 'info';

export interface MessageDialogData {
  type: MessageDialogType;
  title: string;
  message: string;
  buttonText?: string;
}

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-wrapper" [class]="'type-' + data.type">
      <button type="button" class="close-btn" (click)="close()" aria-label="Close dialog">
        <i class="pi pi-times"></i>
      </button>

      <div class="icon-ring">
        <div class="icon-circle">
          <i [class]="iconClass"></i>
        </div>
      </div>

      <h2 class="dialog-title">{{ data.title }}</h2>
      <p class="dialog-message">{{ data.message }}</p>

      <button type="button" class="action-btn" (click)="close()">
        {{ data.buttonText || 'OK' }}
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dialog-wrapper {
        position: relative;
        padding: 40px 32px 32px;
        text-align: center;
        background: #ffffff;
        border-radius: 24px;
        min-width: 320px;
        max-width: 420px;

        // per-type accent colors
        --accent: #667eea;
        --accent-2: #764ba2;
        --accent-soft: rgba(102, 126, 234, 0.12);

        &.type-success {
          --accent: #22c58b;
          --accent-2: #4facfe;
          --accent-soft: rgba(34, 197, 139, 0.12);
        }

        &.type-error {
          --accent: #f5576c;
          --accent-2: #f093fb;
          --accent-soft: rgba(245, 87, 108, 0.12);
        }

        &.type-warning {
          --accent: #f6a821;
          --accent-2: #fcb69f;
          --accent-soft: rgba(246, 168, 33, 0.14);
        }
      }

      .close-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.05);
        color: rgba(0, 0, 0, 0.45);
        cursor: pointer;
        transition: all 0.25s ease;

        i {
          font-size: 14px;
        }

        &:hover {
          background: rgba(0, 0, 0, 0.1);
          color: rgba(0, 0, 0, 0.7);
          transform: rotate(90deg);
        }
      }

      .icon-ring {
        width: 96px;
        height: 96px;
        margin: 0 auto 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--accent-soft);
        animation: ringPulse 2s ease-in-out infinite;
      }

      .icon-circle {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
        box-shadow: 0 8px 20px var(--accent-soft);
        animation: iconPop 0.45s cubic-bezier(0.68, -0.55, 0.265, 1.55);

        i {
          font-size: 30px;
          color: #ffffff;
        }
      }

      .dialog-title {
        margin: 0 0 10px;
        font-size: 22px;
        font-weight: 800;
        color: #1a1a2e;
        letter-spacing: -0.3px;
      }

      .dialog-message {
        margin: 0 0 28px;
        font-size: 15px;
        line-height: 1.6;
        color: rgba(0, 0, 0, 0.6);
        font-weight: 500;
      }

      .action-btn {
        width: 100%;
        height: 50px;
        border: none;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
        color: #ffffff;
        font-family: inherit;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 6px 16px var(--accent-soft);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
          box-shadow: 0 10px 24px var(--accent-soft);
        }

        &:active {
          transform: translateY(0);
        }
      }

      @keyframes iconPop {
        from {
          transform: scale(0.3);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes ringPulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.04);
        }
      }
    `,
  ],
})
export class MessageDialogComponent {
  readonly data = inject<MessageDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MessageDialogComponent>);

  get iconClass(): string {
    switch (this.data.type) {
      case 'success':
        return 'pi pi-check';
      case 'error':
        return 'pi pi-times';
      case 'warning':
        return 'pi pi-exclamation-triangle';
      default:
        return 'pi pi-info';
    }
  }

  close() {
    this.dialogRef.close();
  }
}
