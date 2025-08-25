import { Component } from '@angular/core';

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  startDate: string;
  salary: number;
}

@Component({
  selector: 'table[app-table]',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.scss'
})
export class Table {
  employees: Employee[] = [
    {
      id: 1,
      name: 'John Smith',
      position: 'Software Engineer',
      department: 'Engineering',
      email: 'john.smith@company.com',
      startDate: '2023-01-15',
      salary: 75000
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'Product Manager',
      department: 'Product',
      email: 'sarah.johnson@company.com',
      startDate: '2022-08-20',
      salary: 85000
    },
    {
      id: 3,
      name: 'Michael Brown',
      position: 'UX Designer',
      department: 'Design',
      email: 'michael.brown@company.com',
      startDate: '2023-03-10',
      salary: 68000
    },
    {
      id: 4,
      name: 'Emily Davis',
      position: 'Data Analyst',
      department: 'Analytics',
      email: 'emily.davis@company.com',
      startDate: '2023-05-05',
      salary: 70000
    },
    {
      id: 5,
      name: 'David Wilson',
      position: 'DevOps Engineer',
      department: 'Engineering',
      email: 'david.wilson@company.com',
      startDate: '2022-11-12',
      salary: 80000
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      position: 'Marketing Manager',
      department: 'Marketing',
      email: 'lisa.anderson@company.com',
      startDate: '2023-02-28',
      salary: 72000
    }
  ];
}
