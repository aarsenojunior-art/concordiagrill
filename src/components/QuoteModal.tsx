import React, { useState } from 'react';
import { X, Send, Calendar, MapPin, User, Phone, CheckCircle, MessageSquare } from 'lucide-react';

interface ProposalDetails {
  packageCode: string;
  packageName: string;
  guests: number;
  estimatedTotal: string;
  extras: string[];
  termsConfirmed: boolean;
}

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalDetails?: ProposalDetails | null;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  proposalDetails,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare WhatsApp Message text
    const pkgName = proposalDetails ? `${proposalDetails.packageCode} - ${proposalDetails.packageName}` : 'Proposta Geral';
    const numGuests = proposalDetails ? proposalDetails.guests : 'A definir';
    const totalEst = proposalDetails ? proposalDetails.estimatedTotal : 'A definir';
    const extrasText = proposalDetails && proposalDetails.extras.length > 0 
      ? `\n- Opcionais: ${proposalDetails.extras.join(', ')}` 
      : '';

    const text = encodeURIComponent(
      `Olá, Concórdia Grill!\n\n` +
      `Gostaria de validar uma proposta para o meu evento:\n` +
      `• Pacote: ${pkgName}\n` +
      `• Convidados pretendidos: ${numGuests}\n` +
      `• Estimativa: ${totalEst}${extrasText}\n` +
      `• Data pretendida: ${eventDate || 'A combinar'}\n` +
      `• Local/Bairro: ${location || 'A definir'}\n` +
      `• Responsável: ${name}\n` +
      `• Contato: ${phone}\n` +
      (notes ? `• Observações: ${notes}\n` : '') +
      `\nPoderiam verificar a disponibilidade de agenda e os detalhes dos cortes? Obrigado!`
    );

    const link = `https://api.whatsapp.com/send?phone=5511999999999&text=${text}`;
    setWhatsappLink(link);
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-gray-50 border border-gray-200 rounded-none shadow-2xl p-6 sm:p-8 flex flex-col gap-5 text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900 rounded-none hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div>
              <span className="text-xs text-amber-600 font-bold uppercase tracking-widest">
                Validação Direta de Agenda
              </span>
              <h3 className="text-2xl font-bold font-editorial text-gray-900 mt-1">
                Falar com Concórdia Grill
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Envie suas informações para confirmarmos data, local e cardápio diretamente com nossa gerência.
              </p>
            </div>

            {/* Proposal Summary Pill if initiated from Simulator or Cart */}
            {proposalDetails && (
              <div className="p-3 bg-gray-100 border border-gray-200 rounded-none text-xs flex flex-col gap-1">
                <div className="flex items-center justify-between text-gray-600">
                  <span className="font-bold text-amber-600">
                    {proposalDetails.packageCode} — {proposalDetails.packageName}
                  </span>
                  <span>{proposalDetails.guests} convidados</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 border-t border-gray-200 pt-1 mt-1">
                  <span>Valor Estimado:</span>
                  <span className="font-bold text-gray-900">{proposalDetails.estimatedTotal}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-900 font-semibold mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Silveira"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-none bg-gray-100 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#e03131] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-900 font-semibold mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-600 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-none bg-gray-100 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#e03131] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-1">
                    Data Pretendida *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-600 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-none bg-gray-100 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#e03131] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-1">
                  Local / Bairro do Evento (Grande SP) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tatuapé, Moema, Alphaville ou Salão próprio"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-none bg-gray-100 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#e03131] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-1">
                  Observações ou Pedidos Especiais
                </label>
                <textarea
                  rows={2}
                  placeholder="Alguma restrição alimentar ou detalhe específico?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-none bg-gray-100 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#e03131] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-none bg-gray-100 hover:bg-[#2d3448] text-xs font-semibold uppercase tracking-wider text-gray-900 transition-colors cursor-pointer border border-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-none bg-[#e03131] hover:bg-[#bc121c] text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-colors flex items-center gap-2 cursor-pointer border border-[#e03131]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gerar Mensagem WhatsApp</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-8 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-none bg-[#af8d11]/20 border border-[#e9c349] flex items-center justify-center text-amber-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-syne text-gray-900">
                Proposta Pronta para Envio!
              </h3>
              <p className="text-xs text-gray-600 max-w-sm mt-1">
                Clique no botão abaixo para conversar diretamente com nossa equipe no WhatsApp e confirmar a agenda.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full justify-center">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-none bg-[#25D366] hover:bg-[#20b858] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir WhatsApp Agora</span>
              </a>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-3 rounded-none bg-gray-100 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#2d3448] border border-gray-200 cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
