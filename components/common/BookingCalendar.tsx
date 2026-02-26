import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for local module.
import type { Lawyer, TimeSlot, View } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, BadgeCheckIcon, CreditCardIcon, QrcodeIcon } from './IconComponents';

interface BookingCalendarProps {
  lawyer: Lawyer;
  onClose: () => void;
  onNavigate: (view: View) => void;
}

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ lawyer, onClose, onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'date' | 'time' | 'payment' | 'success'>('date');
  const [isConfirming, setIsConfirming] = useState(false);

  const availabilityMap = useMemo(() => {
    const map = new Map<string, TimeSlot[]>();
    lawyer.availability?.forEach(day => {
      if (day.slots.some(slot => !slot.isBooked)) {
        map.set(day.date, day.slots);
      }
    });
    return map;
  }, [lawyer.availability]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const handleDateSelect = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    setSelectedTime(null);
    setStep('time');
  };

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };
  
  const sendConfirmationEmail = async (details: { 
    lawyerName: string; 
    date: Date | null; 
    time: string | null; 
    clientEmail: string;
  }) => {
    // This is a placeholder for a real email sending service (e.g., using fetch to call a backend API)
    console.log(`--- SIMULATING EMAIL CONFIRMATION ---`);
    console.log(`To: ${details.clientEmail}`);
    console.log(`Subject: Confirmação de Agendamento - Legis Connect`);
    console.log(`Body: Olá! Sua consulta com ${details.lawyerName} foi agendada para ${details.date?.toLocaleDateString('pt-BR')} às ${details.time}.`);
    console.log(`------------------------------------`);
    
    // Simulate network delay
    return new Promise(resolve => setTimeout(resolve, 1200));
  };
  
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsConfirming(true);
    try {
      await sendConfirmationEmail({
        lawyerName: lawyer.name,
        date: selectedDate,
        time: selectedTime,
        clientEmail: 'cliente@example.com', // In a real app, this would come from user data
      });
      setStep('success');
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      alert("Ocorreu um erro ao confirmar o agendamento. Tente novamente.");
    } finally {
      setIsConfirming(false);
    }
  };
  
  const renderCalendarGrid = () => {
    const dates = [];
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      dates.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const isAvailable = availabilityMap.has(dateString);
      const isPast = date < today;
      
      let classes = "w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors ";
      if (isPast || !isAvailable) {
        classes += "text-gray-400 cursor-not-allowed";
      } else {
        classes += "text-gray-700 hover:bg-primary/20";
        if (selectedDate?.toDateString() === date.toDateString()) {
            classes += " bg-primary text-white font-bold";
        }
      }
      
      dates.push(
        <div key={day} className={classes} onClick={() => !isPast && isAvailable && handleDateSelect(day)}>
          {day}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-y-2 place-items-center">{dates}</div>;
  };
  
  const availableSlots = selectedDate ? availabilityMap.get(selectedDate.toISOString().split('T')[0]) : [];

  const renderContent = () => {
    const consultationFee = lawyer.consultationFee || 0;
    const platformFee = consultationFee * 0.10; // 10% platform fee
    const total = consultationFee + platformFee;

    switch (step) {
        case 'payment':
            return (
                <div className="p-6">
                    <button onClick={() => setStep('time')} className="text-sm text-primary hover:underline mb-4">&larr; Voltar para horários</button>
                    <h3 className="text-xl font-bold text-gray-800 text-center">Resumo e Pagamento</h3>
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
                        <p className="font-semibold text-gray-800">{lawyer.name}</p>
                        <p className="text-sm text-gray-600">
                            {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-600">Horário: <strong>{selectedTime}</strong></p>
                    </div>
                    <div className="mt-4 space-y-2 border-t pt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Valor da Consulta</span>
                            <span className="text-gray-800">R$ {consultationFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Taxa da Plataforma (10%)</span>
                            <span className="text-gray-800">R$ {platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-md">
                            <span className="text-gray-800">Total a pagar</span>
                            <span className="text-primary">R$ {total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <button onClick={handleConfirmBooking} disabled={isConfirming} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                            <CreditCardIcon className="w-5 h-5" />
                            {isConfirming ? 'Processando...' : 'Pagar com Cartão de Crédito'}
                        </button>
                        <button onClick={handleConfirmBooking} disabled={isConfirming} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors">
                            <QrcodeIcon className="w-5 h-5" />
                             {isConfirming ? 'Processando...' : 'Pagar com Pix'}
                        </button>
                    </div>
                </div>
            );
      case 'success':
        return (
          <div className="text-center p-8 pt-12">
            <BadgeCheckIcon className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-gray-800 mt-4">Consulta Agendada!</h3>
            <p className="text-gray-600 mt-2">
              Sua consulta com <strong>{lawyer.name}</strong> foi confirmada para o dia{' '}
              <strong>{selectedDate?.toLocaleDateString('pt-BR')}</strong> às <strong>{selectedTime}</strong>.
            </p>
            <p className="text-sm text-gray-500 mt-4">Você receberá um e-mail de confirmação em breve.</p>
            <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                <button onClick={onClose} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                  Fechar
                </button>
                <button onClick={() => onNavigate('dashboard')} className="w-full bg-primary/10 text-primary font-bold py-3 px-4 rounded-lg hover:bg-primary/20 transition-colors">
                  Ver meus casos
                </button>
            </div>
          </div>
        );
      case 'time':
      case 'date':
        return (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <button onClick={() => changeMonth(-1)} disabled={currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"><ChevronLeftIcon className="w-5 h-5" /></button>
              <h3 className="font-bold text-lg">{`${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}</h3>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
                {DAY_NAMES.map(day => <div key={day}>{day}</div>)}
              </div>
              {renderCalendarGrid()}
            </div>
            {selectedDate && (
              <div className="p-4 border-t">
                <h4 className="font-semibold text-center mb-3">Horários disponíveis para {selectedDate.toLocaleDateString('pt-BR')}</h4>
                <div className="grid grid-cols-3 gap-2">
                    {availableSlots?.map(slot => (
                        <button 
                            key={slot.time}
                            disabled={slot.isBooked}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-2 rounded-md text-sm transition-colors ${slot.isBooked ? 'bg-gray-200 text-gray-400 line-through cursor-not-allowed' : (selectedTime === slot.time ? 'bg-primary text-white font-bold' : 'bg-primary/10 text-primary hover:bg-primary/20')}`}
                        >{slot.time}</button>
                    ))}
                </div>
                {selectedTime && (
                    <button 
                        onClick={() => setStep('payment')} 
                        className="mt-4 w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Ir para Pagamento
                    </button>
                )}
              </div>
            )}
          </>
        );
    }
  };

  return (
    <>
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="text-xl font-bold text-gray-800">Agendar Consulta</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
          aria-label="Close"
        >
          <XIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      {renderContent()}
    </>
  );
};