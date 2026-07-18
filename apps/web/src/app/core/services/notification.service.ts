import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  MessageDialogComponent,
  MessageDialogData,
  MessageDialogType,
} from '@shared/components/message-dialog/message-dialog.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly dialog = inject(MatDialog);

  show(
    type: MessageDialogType,
    title: string,
    message: string,
    buttonText?: string
  ): MatDialogRef<MessageDialogComponent> {
    return this.dialog.open<MessageDialogComponent, MessageDialogData>(MessageDialogComponent, {
      data: { type, title, message, buttonText },
      panelClass: 'message-dialog-panel',
      width: '400px',
      maxWidth: '92vw',
      autoFocus: false,
      restoreFocus: true,
    });
  }

  success(title: string, message: string, buttonText = 'Great!') {
    return this.show('success', title, message, buttonText);
  }

  error(title: string, message: string, buttonText = 'Try Again') {
    return this.show('error', title, message, buttonText);
  }

  warning(title: string, message: string, buttonText = 'Got It') {
    return this.show('warning', title, message, buttonText);
  }

  info(title: string, message: string, buttonText = 'OK') {
    return this.show('info', title, message, buttonText);
  }
}
