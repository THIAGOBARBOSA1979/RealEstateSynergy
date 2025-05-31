import { useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface WhatsAppFloatProps {
  phoneNumber?: string;
  message?: string;
  position?: "bottom-right" | "bottom-left";
}

const WhatsAppFloat = ({ 
  phoneNumber = "5511999999999", 
  message = "Olá! Gostaria de mais informações sobre a ImobCloud.",
  position = "bottom-right"
}: WhatsAppFloatProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6"
  };

  return (
    <>
      {/* Bubble de conversa (aparece quando hover) */}
      {isOpen && (
        <div className={`fixed ${positionClasses[position]} mb-20 z-40 animate-in slide-in-from-bottom-2`}>
          <Card className="w-64 shadow-lg border-0 bg-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <SiWhatsapp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Suporte ImobCloud</p>
                    <p className="text-xs text-green-600">Online agora</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700">
                  Olá! 👋 Como podemos ajudar você hoje?
                </p>
              </div>
              
              <Button 
                onClick={handleWhatsAppClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <SiWhatsapp className="w-4 h-4 mr-2" />
                Iniciar conversa
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botão flutuante principal */}
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <div className="relative">
          {/* Indicador de notificação */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          
          {/* Botão principal */}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            size="sm"
          >
            <SiWhatsapp className="w-6 h-6 text-white" />
          </Button>
          
          {/* Animação de pulso */}
          <div className="absolute inset-0 w-14 h-14 rounded-full bg-green-400 animate-ping opacity-20"></div>
        </div>
      </div>
    </>
  );
};

export default WhatsAppFloat;