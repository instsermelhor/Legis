// Mock data for Admin Panel

export interface MockClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  activeCases: number;
  totalCases: number;
  joinedDate: string;
  status: 'ativo' | 'inativo';
}

export interface MockIntern {
  id: number;
  name: string;
  email: string;
  phone: string;
  university: string;
  semester: string;
  specialtyInterest: string;
  hoursCompleted: number;
  availableHours: number;
  status: 'ativo' | 'pendente' | 'inativo';
  joinedDate: string;
}

export const mockClients: MockClient[] = [
  { id: 1, name: 'Ana Rodrigues', email: 'ana.rodrigues@email.com', phone: '(11) 91234-5678', address: 'Rua das Acácias, 45, São Paulo, SP', activeCases: 2, totalCases: 3, joinedDate: '2024-01-15', status: 'ativo' },
  { id: 2, name: 'Bruno Ferreira', email: 'bruno.ferreira@email.com', phone: '(21) 98765-4321', address: 'Av. Atlântica, 200, Rio de Janeiro, RJ', activeCases: 1, totalCases: 1, joinedDate: '2024-02-20', status: 'ativo' },
  { id: 3, name: 'Carla Mendes', email: 'carla.mendes@email.com', phone: '(31) 97654-3210', address: 'Rua da Bahia, 123, Belo Horizonte, MG', activeCases: 0, totalCases: 2, joinedDate: '2023-11-05', status: 'inativo' },
  { id: 4, name: 'Daniel Sousa', email: 'daniel.sousa@email.com', phone: '(41) 96543-2109', address: 'Rua XV de Novembro, 88, Curitiba, PR', activeCases: 3, totalCases: 4, joinedDate: '2024-03-01', status: 'ativo' },
  { id: 5, name: 'Eliane Costa', email: 'eliane.costa@email.com', phone: '(85) 95432-1098', address: 'Av. Beira Mar, 500, Fortaleza, CE', activeCases: 1, totalCases: 1, joinedDate: '2024-01-30', status: 'ativo' },
  { id: 6, name: 'Fábio Lima', email: 'fabio.lima@email.com', phone: '(51) 94321-0987', address: 'Av. Osvaldo Aranha, 10, Porto Alegre, RS', activeCases: 0, totalCases: 5, joinedDate: '2023-08-12', status: 'inativo' },
  { id: 7, name: 'Gabriela Oliveira', email: 'gabriela.oliveira@email.com', phone: '(71) 93210-9876', address: 'Av. Tancredo Neves, 300, Salvador, BA', activeCases: 2, totalCases: 2, joinedDate: '2024-02-10', status: 'ativo' },
];

export const mockInterns: MockIntern[] = [
  { id: 1, name: 'Henrique Alves', email: 'henrique.alves@uni.edu.br', phone: '(11) 92345-6789', university: 'PUC-SP', semester: '7º ao 9º semestre', specialtyInterest: 'Direito Civil', hoursCompleted: 120, availableHours: 200, status: 'ativo', joinedDate: '2024-01-10' },
  { id: 2, name: 'Isabela Santos', email: 'isabela.santos@usp.edu.br', phone: '(11) 91234-6789', university: 'USP', semester: '5º ao 6º semestre', specialtyInterest: 'Direito Trabalhista', hoursCompleted: 80, availableHours: 200, status: 'ativo', joinedDate: '2024-02-15' },
  { id: 3, name: 'João Pereira', email: 'joao.pereira@uerj.edu.br', phone: '(21) 92349-1234', university: 'UERJ', semester: '9º ao 10º semestre', specialtyInterest: 'Direito Penal', hoursCompleted: 180, availableHours: 200, status: 'ativo', joinedDate: '2023-10-01' },
  { id: 4, name: 'Karen Martins', email: 'karen.martins@ufmg.edu.br', phone: '(31) 91234-4567', university: 'UFMG', semester: '1º ao 3º semestre', specialtyInterest: 'Direito Constitucional', hoursCompleted: 0, availableHours: 200, status: 'pendente', joinedDate: '2024-03-05' },
  { id: 5, name: 'Lucas Carvalho', email: 'lucas.carvalho@pucpr.edu.br', phone: '(41) 93456-7890', university: 'PUC-PR', semester: '7º ao 9º semestre', specialtyInterest: 'Direito Tributário', hoursCompleted: 95, availableHours: 200, status: 'ativo', joinedDate: '2024-01-20' },
  { id: 6, name: 'Marina Torres', email: 'marina.torres@ufc.edu.br', phone: '(85) 94567-8901', university: 'UFC', semester: '5º ao 6º semestre', specialtyInterest: 'Direito Internacional', hoursCompleted: 50, availableHours: 200, status: 'inativo', joinedDate: '2023-09-15' },
];

// Financial mock data
export interface MonthlyRevenue {
  month: string;
  revenue: number;
  consultations: number;
}

export const mockMonthlyRevenue: MonthlyRevenue[] = [
  { month: 'Out/24', revenue: 42000, consultations: 85 },
  { month: 'Nov/24', revenue: 48500, consultations: 98 },
  { month: 'Dez/24', revenue: 51000, consultations: 105 },
  { month: 'Jan/25', revenue: 38000, consultations: 76 },
  { month: 'Fev/25', revenue: 55000, consultations: 112 },
  { month: 'Mar/25', revenue: 60300, consultations: 121 },
];
