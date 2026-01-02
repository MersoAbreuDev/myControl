import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private fb: FormBuilder) {
    this.initTransactionForm();
  }

  currentDate = new Date();
  
  get currentMonth(): string {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  receitas = 0;
  despesas = 1520;
  saldo = this.receitas - this.despesas;

  showModal = false;
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

  transactions = [
    {
      id: 1,
      name: 'TEste',
      category: 'Alimentação',
      dueDate: '01 jan 2026',
      paidDate: '01 jan',
      amount: 1520,
      status: 'paid',
      type: 'expense' as 'income' | 'expense'
    },
    {
      id: 2,
      name: 'Salário',
      category: 'Trabalho',
      dueDate: '05 jan 2026',
      paidDate: '05 jan',
      amount: 5000,
      status: 'paid',
      type: 'income' as 'income' | 'expense'
    },
    {
      id: 3,
      name: 'Conta de Luz',
      category: 'Utilidades',
      dueDate: '10 jan 2026',
      paidDate: '10 jan',
      amount: 250,
      status: 'paid',
      type: 'expense' as 'income' | 'expense'
    },
    {
      id: 4,
      name: 'Conta de Água',
      category: 'Utilidades',
      dueDate: '15 jan 2026',
      paidDate: '',
      amount: 180,
      status: 'open',
      type: 'expense' as 'income' | 'expense'
    }
  ];

  openMenuTransactionId: number | null = null;

  setActiveTab(tab: 'all' | 'expenses' | 'income') {
    this.activeTab = tab;
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

  toggleMenu(transactionId: number) {
    this.openMenuTransactionId = this.openMenuTransactionId === transactionId ? null : transactionId;
  }

  closeMenu() {
    this.openMenuTransactionId = null;
  }

  editTransaction(transaction: any) {
    this.closeMenu();
    // Preencher o formulário com os dados da transação
    this.transactionType = transaction.type;
    const dueDate = this.parseDate(transaction.dueDate);
    
    this.transactionForm.patchValue({
      description: transaction.name,
      amount: this.formatCurrency(transaction.amount),
      category: transaction.category,
      dueDate: dueDate,
      recurrence: 'Única'
    });
    
    this.showModal = true;
  }

  deleteTransaction(transactionId: number) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      this.transactions = this.transactions.filter(t => t.id !== transactionId);
      this.closeMenu();
    }
  }

  markAsPaid(transaction: any) {
    const today = new Date();
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const paidDate = `${today.getDate()} ${monthNames[today.getMonth()]}`;
    
    const index = this.transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      this.transactions[index] = {
        ...this.transactions[index],
        status: 'paid',
        paidDate: paidDate
      };
    }
    this.closeMenu();
  }

  parseDate(dateStr: string): string {
    // Converte "01 jan 2026" para "2026-01-01"
    const parts = dateStr.split(' ');
    const day = parts[0].padStart(2, '0');
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const month = String(monthNames.indexOf(parts[1].toLowerCase()) + 1).padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() - 1));
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.setMonth(this.currentDate.getMonth() + 1));
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
      // Aqui você pode adicionar a lógica para salvar a transação
      console.log('Transação:', {
        type: this.transactionType,
        ...this.transactionForm.value
      });
      this.closeModal();
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
}

