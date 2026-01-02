import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService, Transaction } from '../../../../core/services/transaction.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {
    this.initTransactionForm();
  }

  ngOnInit() {
    // Aguarda um pouco para garantir que o token está disponível
    setTimeout(() => {
      this.loadDashboard();
      this.loadTransactions();
    }, 100);
  }

  currentDate = new Date();
  
  get currentMonth(): string {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  receitas = 0;
  despesas = 0;
  saldo = 0;
  isLoading = false;

  showModal = false;
  showDeleteModal = false;
  transactionToDelete: number | null = null;
  transactionType: 'income' | 'expense' = 'expense';
  transactionForm!: FormGroup;

  categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Trabalho',
    'Utilidades',
    'Outros'
  ];

  recurrenceOptions = [
    'Única',
    'Mensal',
    'Semanal',
    'Anual'
  ];

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  activeTab: 'all' | 'expenses' | 'income' = 'all';

  transactions: Transaction[] = [];
  editingTransactionId: number | null = null;

  openMenuTransactionId: number | null = null;

  setActiveTab(tab: 'all' | 'expenses' | 'income') {
    this.activeTab = tab;
    this.loadTransactions();
  }

  loadDashboard() {
    const month = this.currentDate.getMonth() + 1;
    const year = this.currentDate.getFullYear();
    
    this.dashboardService.getSummary(month, year).subscribe({
      next: (summary) => {
        this.receitas = summary.receitas / 100; // Converter de centavos para reais
        this.despesas = summary.despesas / 100;
        this.saldo = summary.saldo / 100;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard:', err);
      }
    });
  }

  loadTransactions() {
    this.isLoading = true;
    let type: string | undefined;
    
    if (this.activeTab === 'expenses') {
      type = 'expense';
    } else if (this.activeTab === 'income') {
      type = 'income';
    }
    
    const month = this.currentDate.getMonth() + 1;
    const year = this.currentDate.getFullYear();
    
    this.transactionService.findAll(type, undefined, month, year).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar transações:', err);
        this.isLoading = false;
      }
    });
  }

  getFilteredTransactions() {
    let filtered = this.transactions;
    
    if (this.activeTab === 'expenses') {
      filtered = filtered.filter(t => t.type === 'expense');
    } else if (this.activeTab === 'income') {
      filtered = filtered.filter(t => t.type === 'income');
    }
    
    return filtered;
  }

  getPaidTransactions() {
    return this.getFilteredTransactions().filter(t => t.status === 'paid');
  }

  getOpenTransactions() {
    return this.getFilteredTransactions().filter(t => t.status === 'open');
  }

  formatTransactionDate(dateStr: string): string {
    const date = new Date(dateStr);
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  formatTransactionAmount(amount: number): number {
    return amount / 100; // Converter de centavos para reais
  }

  toggleMenu(transactionId: number | undefined) {
    if (!transactionId) return;
    this.openMenuTransactionId = this.openMenuTransactionId === transactionId ? null : transactionId;
  }

  closeMenu() {
    this.openMenuTransactionId = null;
  }

  editTransaction(transaction: Transaction) {
    this.closeMenu();
    this.editingTransactionId = transaction.id!;
    this.transactionType = transaction.type;
    
    const dueDate = new Date(transaction.dueDate);
    const formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
    
    this.transactionForm.patchValue({
      description: transaction.description,
      amount: this.formatCurrency(transaction.amount / 100),
      category: transaction.category,
      dueDate: formattedDate,
      recurrence: transaction.recurrence
    });
    
    this.showModal = true;
  }

  openDeleteModal(transactionId: number) {
    this.transactionToDelete = transactionId;
    this.showDeleteModal = true;
    this.closeMenu();
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.transactionToDelete = null;
  }

  confirmDelete() {
    if (this.transactionToDelete) {
      this.transactionService.delete(this.transactionToDelete).subscribe({
        next: () => {
          this.loadTransactions();
          this.loadDashboard();
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Erro ao excluir transação:', err);
          alert('Erro ao excluir transação. Tente novamente.');
          this.closeDeleteModal();
        }
      });
    }
  }

  markAsPaid(transaction: Transaction) {
    const actionText = transaction.type === 'expense' ? 'paga' : 'recebida';
    
    this.transactionService.markAsPaid(transaction.id!).subscribe({
      next: () => {
        this.loadTransactions();
        this.loadDashboard();
        this.closeMenu();
      },
      error: (err) => {
        console.error(`Erro ao marcar como ${actionText}:`, err);
        alert(`Erro ao marcar transação como ${actionText}. Tente novamente.`);
      }
    });
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));
    this.loadDashboard();
    this.loadTransactions();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1));
    this.loadDashboard();
    this.loadTransactions();
  }

  initTransactionForm() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    this.transactionForm = this.fb.group({
      description: ['', [Validators.required]],
      amount: ['0,00', [Validators.required]],
      category: ['', [Validators.required]],
      dueDate: [formattedDate, [Validators.required]],
      recurrence: ['Única', [Validators.required]]
    });
  }

  openModal() {
    this.showModal = true;
    this.transactionType = 'expense';
    this.initTransactionForm();
    this.closeMenu();
  }

  closeModal() {
    this.showModal = false;
    this.editingTransactionId = null;
    this.transactionForm.reset();
    this.initTransactionForm();
  }

  setTransactionType(type: 'income' | 'expense') {
    this.transactionType = type;
  }

  formatCurrencyInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value === '') {
      value = '0';
    }
    const formatted = (parseInt(value) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    this.transactionForm.patchValue({ amount: formatted });
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      
      // Converter valor de reais para centavos
      const amountStr = formValue.amount.replace(/\D/g, '');
      const amount = parseInt(amountStr);
      
      const transactionData = {
        description: formValue.description,
        amount: amount,
        category: formValue.category,
        type: this.transactionType,
        dueDate: formValue.dueDate,
        recurrence: formValue.recurrence
      };

      if (this.editingTransactionId) {
        // Atualizar transação existente
        this.transactionService.update(this.editingTransactionId, transactionData).subscribe({
          next: () => {
            this.loadTransactions();
            this.loadDashboard();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erro ao atualizar transação:', err);
            alert('Erro ao atualizar transação. Tente novamente.');
          }
        });
      } else {
        // Criar nova transação
        this.transactionService.create(transactionData).subscribe({
          next: () => {
            this.loadTransactions();
            this.loadDashboard();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erro ao criar transação:', err);
            alert('Erro ao criar transação. Tente novamente.');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.transactionForm.controls).forEach(key => {
      const control = this.transactionForm.get(key);
      control?.markAsTouched();
    });
  }

  logout() {
    this.authService.logout();
  }
}

