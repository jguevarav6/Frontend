import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-animated-character',
  template: `
    <div class="character-wrapper">
      <svg 
        width="260" 
        height="260" 
        viewBox="0 0 260 260" 
        class="animated-character">
        
        <!-- Definiciones profesionales -->
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#F8FAFC;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#E2E8F0;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#FFEBD1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FFD6A5;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="suitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#1E293B;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0F172A;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.12"/>
          </filter>
        </defs>
        
        <!-- Fondo sutil -->
        <circle cx="130" cy="130" r="120" fill="url(#bgGradient)" opacity="0.4"/>
        
        <!-- Documentos flotantes decorativos (fondo) -->
        <g class="floating-docs" opacity="0.3">
          <rect x="30" y="50" width="35" height="45" rx="3" fill="#3B82F6" transform="rotate(-15 47.5 72.5)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-15 47.5 72.5; -20 47.5 72.5; -15 47.5 72.5"
              dur="4s"
              repeatCount="indefinite"/>
          </rect>
          <rect x="215" y="60" width="30" height="40" rx="3" fill="#10B981" transform="rotate(12 230 80)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="12 230 80; 17 230 80; 12 230 80"
              dur="5s"
              repeatCount="indefinite"/>
          </rect>
        </g>
        
        <!-- Cuerpo (camisa formal) -->
        <g filter="url(#shadow)">
          <path d="M 90 150 L 90 230 Q 90 240, 100 240 L 180 240 Q 190 240, 190 230 L 190 150 Z" 
                fill="url(#bodyGradient)" 
                stroke="#1E40AF" 
                stroke-width="2"/>
          
          <!-- Cuello de camisa -->
          <path d="M 125 150 L 115 160 L 125 165 L 140 155 L 155 165 L 165 160 L 155 150 Z" 
                fill="white" 
                stroke="#1E40AF" 
                stroke-width="1.5"/>
          
          <!-- Corbata elegante -->
          <path d="M 140 155 L 135 175 L 137 200 L 140 220 L 143 200 L 145 175 Z" 
                fill="#DC2626" 
                stroke="#991B1B" 
                stroke-width="1.5"/>
          
          <!-- Nudo de corbata -->
          <ellipse cx="140" cy="157" rx="6" ry="4" fill="#B91C1C" stroke="#7F1D1D" stroke-width="1"/>
          
          <!-- Botones de camisa -->
          <circle cx="140" cy="180" r="3" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="0.8"/>
          <circle cx="140" cy="200" r="3" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="0.8"/>
          <circle cx="140" cy="220" r="3" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="0.8"/>
        </g>
        
        <!-- Cabeza -->
        <g filter="url(#shadow)">
          <ellipse cx="140" cy="100" rx="52" ry="58" fill="url(#headGradient)" stroke="#D4A574" stroke-width="2.5"/>
          
          <!-- Orejas -->
          <ellipse cx="95" cy="105" rx="10" ry="15" fill="#FFDAB9" stroke="#D4A574" stroke-width="1.5"/>
          <ellipse cx="185" cy="105" rx="10" ry="15" fill="#FFDAB9" stroke="#D4A574" stroke-width="1.5"/>
          
          <!-- Detalles de orejas -->
          <ellipse cx="95" cy="105" rx="5" ry="8" fill="#FFE4B5" opacity="0.6"/>
          <ellipse cx="185" cy="105" rx="5" ry="8" fill="#FFE4B5" opacity="0.6"/>
        </g>
        
        <!-- Cabello profesional -->
        <g>
          <path d="M 88 70 Q 85 50, 100 55 Q 105 45, 120 50 Q 130 42, 140 45 Q 150 42, 160 50 Q 175 45, 180 55 Q 195 50, 192 70 L 188 75 Q 185 65, 175 68 Q 165 60, 155 65 Q 145 58, 140 60 Q 135 58, 125 65 Q 115 60, 105 68 Q 95 65, 92 75 Z" 
                fill="#2C3E50" 
                stroke="#1A252F" 
                stroke-width="1.5"/>
          
          <!-- Detalles del cabello -->
          <path d="M 110 55 Q 115 50, 120 55" stroke="#1A252F" stroke-width="1.2" fill="none" opacity="0.4"/>
          <path d="M 130 48 Q 135 45, 140 48" stroke="#1A252F" stroke-width="1.2" fill="none" opacity="0.4"/>
          <path d="M 150 48 Q 155 45, 160 50" stroke="#1A252F" stroke-width="1.2" fill="none" opacity="0.4"/>
        </g>
        
        <!-- Cejas expresivas -->
        <g class="eyebrows">
          <path d="M 115 85 Q 120 82, 130 84" 
                stroke="#2C3E50" 
                stroke-width="3.5" 
                fill="none" 
                stroke-linecap="round"
                [attr.d]="isTypingPassword ? 'M 115 87 Q 120 85, 130 86' : 'M 115 85 Q 120 82, 130 84'"/>
          <path d="M 150 84 Q 160 82, 165 85" 
                stroke="#2C3E50" 
                stroke-width="3.5" 
                fill="none" 
                stroke-linecap="round"
                [attr.d]="isTypingPassword ? 'M 150 86 Q 160 85, 165 87' : 'M 150 84 Q 160 82, 165 85'"/>
        </g>
        
        <!-- Ojos (estados diferentes) -->
        <g [class.hidden]="isTypingPassword" class="eyes-open">
          <!-- Blancos de los ojos -->
          <ellipse cx="120" cy="98" rx="12" ry="16" fill="white" stroke="#2C3E50" stroke-width="2.5"/>
          <ellipse cx="160" cy="98" rx="12" ry="16" fill="white" stroke="#2C3E50" stroke-width="2.5"/>
          
          <!-- Iris -->
          <ellipse 
            [attr.cx]="isTypingEmail ? 121 : 120" 
            [attr.cy]="isTypingEmail ? 100 : 98" 
            rx="8" 
            ry="10" 
            fill="#4F46E5"/>
          <ellipse 
            [attr.cx]="isTypingEmail ? 161 : 160" 
            [attr.cy]="isTypingEmail ? 100 : 98" 
            rx="8" 
            ry="10" 
            fill="#4F46E5"/>
          
          <!-- Pupilas -->
          <circle 
            [attr.cx]="isTypingEmail ? 121 : 120" 
            [attr.cy]="isTypingEmail ? 100 : 98" 
            r="5" 
            fill="#1E1B4B"/>
          <circle 
            [attr.cx]="isTypingEmail ? 161 : 160" 
            [attr.cy]="isTypingEmail ? 100 : 98" 
            r="5" 
            fill="#1E1B4B"/>
          
          <!-- Brillo en los ojos -->
          <circle 
            [attr.cx]="isTypingEmail ? 118 : 117" 
            [attr.cy]="isTypingEmail ? 96 : 94" 
            r="2.5" 
            fill="white" 
            opacity="0.9"/>
          <circle 
            [attr.cx]="isTypingEmail ? 158 : 157" 
            [attr.cy]="isTypingEmail ? 96 : 94" 
            r="2.5" 
            fill="white" 
            opacity="0.9"/>
        </g>
        
        <!-- Ojos cerrados (cuando escribe contraseña) -->
        <g [class.hidden]="!isTypingPassword" class="eyes-closed">
          <path d="M 108 98 Q 120 95, 132 98" 
                stroke="#2C3E50" 
                stroke-width="3" 
                fill="none" 
                stroke-linecap="round"/>
          <path d="M 148 98 Q 160 95, 172 98" 
                stroke="#2C3E50" 
                stroke-width="3" 
                fill="none" 
                stroke-linecap="round"/>
          
          <!-- Pestañas -->
          <path d="M 110 97 L 108 94" stroke="#2C3E50" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 120 95 L 120 92" stroke="#2C3E50" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 130 97 L 132 94" stroke="#2C3E50" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 150 97 L 148 94" stroke="#2C3E50" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 160 95 L 160 92" stroke="#2C3E50" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M 170 97 L 172 94" stroke="#2C3E50" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        
        <!-- Nariz elegante -->
        <path d="M 140 108 L 138 118 Q 140 120, 142 118 Z" 
              fill="#FFDAB9" 
              stroke="#D4A574" 
              stroke-width="1.2"/>
        <ellipse cx="137" cy="119" rx="2" ry="1.5" fill="#FFE4B5" opacity="0.6"/>
        
        <!-- Boca sonriente -->
        <path [attr.d]="getMouthPath()" 
              stroke="#2C3E50" 
              stroke-width="2.5" 
              fill="none" 
              stroke-linecap="round"/>
        
        <!-- Mejillas sonrojadas -->
        <ellipse cx="105" cy="115" rx="10" ry="6" fill="#FFB6C1" opacity="0.4"/>
        <ellipse cx="175" cy="115" rx="10" ry="6" fill="#FFB6C1" opacity="0.4"/>
        
        <!-- Gafas profesionales (opcional, siempre visibles) -->
        <g class="glasses" opacity="0.9">
          <ellipse cx="120" cy="98" rx="16" ry="18" fill="none" stroke="#34495E" stroke-width="2.5"/>
          <ellipse cx="160" cy="98" rx="16" ry="18" fill="none" stroke="#34495E" stroke-width="2.5"/>
          <path d="M 136 98 L 144 98" stroke="#34495E" stroke-width="2.5"/>
          <path d="M 104 98 L 98 100" stroke="#34495E" stroke-width="2"/>
          <path d="M 176 98 L 182 100" stroke="#34495E" stroke-width="2"/>
          
          <!-- Brillo en las gafas -->
          <path d="M 110 90 L 115 88" stroke="white" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>
          <path d="M 150 90 L 155 88" stroke="white" stroke-width="1.5" opacity="0.6" stroke-linecap="round"/>
        </g>
        
        <!-- Brazos (estado normal) -->
        <g [class.hidden]="isTypingPassword" class="arms-normal">
          <!-- Brazo izquierdo -->
          <path d="M 90 160 Q 65 170, 55 190 L 50 195" 
                stroke="url(#headGradient)" 
                stroke-width="16" 
                fill="none" 
                stroke-linecap="round"/>
          <!-- Mano izquierda -->
          <circle cx="48" cy="198" r="12" fill="#FFDAB9" stroke="#D4A574" stroke-width="1.8"/>
          
          <!-- Brazo derecho -->
          <path d="M 190 160 Q 215 170, 225 190 L 230 195" 
                stroke="url(#headGradient)" 
                stroke-width="16" 
                fill="none" 
                stroke-linecap="round"/>
          <!-- Mano derecha -->
          <circle cx="232" cy="198" r="12" fill="#FFDAB9" stroke="#D4A574" stroke-width="1.8"/>
          
          <!-- Calculadora mejorada -->
          <g transform="translate(30, 185)">
            <rect width="35" height="48" rx="4" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
            <rect x="3" y="3" width="29" height="14" rx="2" fill="#34D399"/>
            <text x="17.5" y="13" font-size="9" fill="#065F46" text-anchor="middle" font-weight="bold">888</text>
            <!-- Botones -->
            <circle cx="8" cy="25" r="3" fill="#475569"/>
            <circle cx="17.5" cy="25" r="3" fill="#475569"/>
            <circle cx="27" cy="25" r="3" fill="#475569"/>
            <circle cx="8" cy="33" r="3" fill="#475569"/>
            <circle cx="17.5" cy="33" r="3" fill="#475569"/>
            <circle cx="27" cy="33" r="3" fill="#475569"/>
            <circle cx="8" cy="41" r="3" fill="#EF4444"/>
            <circle cx="17.5" cy="41" r="3" fill="#475569"/>
            <circle cx="27" cy="41" r="3" fill="#10B981"/>
          </g>
          
          <!-- Documentos mejorados -->
          <g transform="translate(205, 185)">
            <rect width="30" height="40" rx="2" fill="white" stroke="#3B82F6" stroke-width="2"/>
            <line x1="4" y1="8" x2="26" y2="8" stroke="#3B82F6" stroke-width="1.5"/>
            <line x1="4" y1="14" x2="26" y2="14" stroke="#60A5FA" stroke-width="1.2"/>
            <line x1="4" y1="19" x2="20" y2="19" stroke="#60A5FA" stroke-width="1.2"/>
            <line x1="4" y1="24" x2="26" y2="24" stroke="#60A5FA" stroke-width="1.2"/>
            <circle cx="15" cy="33" r="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
            <text x="15" y="37" font-size="10" fill="#B45309" text-anchor="middle" font-weight="bold">$</text>
          </g>
        </g>
        
        <!-- Brazos tapando ojos (cuando escribe contraseña) -->
        <g [class.hidden]="!isTypingPassword" class="arms-covering">
          <!-- Brazo izquierdo levantado -->
          <path d="M 90 160 Q 75 120, 105 92" 
                stroke="url(#headGradient)" 
                stroke-width="16" 
                fill="none" 
                stroke-linecap="round"/>
          <circle cx="105" cy="92" r="14" fill="#FFDAB9" stroke="#D4A574" stroke-width="2"/>
          <!-- Dedos mano izquierda -->
          <ellipse cx="100" cy="88" rx="4" ry="6" fill="#FFDAB9" transform="rotate(-20 100 88)"/>
          <ellipse cx="108" cy="87" rx="4" ry="6" fill="#FFDAB9" transform="rotate(-10 108 87)"/>
          
          <!-- Brazo derecho levantado -->
          <path d="M 190 160 Q 205 120, 175 92" 
                stroke="url(#headGradient)" 
                stroke-width="16" 
                fill="none" 
                stroke-linecap="round"/>
          <circle cx="175" cy="92" r="14" fill="#FFDAB9" stroke="#D4A574" stroke-width="2"/>
          <!-- Dedos mano derecha -->
          <ellipse cx="180" cy="88" rx="4" ry="6" fill="#FFDAB9" transform="rotate(20 180 88)"/>
          <ellipse cx="172" cy="87" rx="4" ry="6" fill="#FFDAB9" transform="rotate(10 172 87)"/>
        </g>
      </svg>
      
      <!-- Mensaje del personaje (mejorado) -->
      <div class="speech-bubble" [class.show]="showMessage" [class.typing-email]="isTypingEmail" [class.typing-password]="isTypingPassword">
        <div class="bubble-content">
          <span class="bubble-icon">{{ getBubbleIcon() }}</span>
          <p class="bubble-text">{{ message }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .character-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 30px 0;
      position: relative;
    }
    
    .animated-character {
      filter: drop-shadow(0 10px 25px rgba(59, 130, 246, 0.2));
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animated-character:hover {
      transform: translateY(-5px) scale(1.02);
      filter: drop-shadow(0 15px 35px rgba(59, 130, 246, 0.3));
    }
    
    .hidden {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .eyebrows path {
      transition: all 0.3s ease-out;
    }
    
    .eyes-open ellipse,
    .eyes-open circle {
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .eyes-closed {
      animation: blink 0.3s ease-in-out;
    }
    
    .arms-covering {
      animation: coverEyes 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .arms-normal {
      animation: uncoverEyes 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .floating-docs rect {
      opacity: 0.25;
    }
    
    .glasses {
      transition: all 0.3s ease;
    }
    
    @keyframes blink {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }
    
    @keyframes coverEyes {
      0% {
        opacity: 0;
        transform: translateY(30px);
      }
      60% {
        opacity: 0.8;
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes uncoverEyes {
      0% {
        opacity: 0;
        transform: translateY(-10px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .speech-bubble {
      position: relative;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 24px;
      padding: 18px 28px;
      margin-top: 25px;
      box-shadow: 
        0 4px 6px rgba(0, 0, 0, 0.07),
        0 10px 20px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      max-width: 320px;
      opacity: 0;
      transform: translateY(-15px) scale(0.95);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid #e0f2fe;
    }
    
    .speech-bubble.typing-email {
      border-color: #3b82f6;
      box-shadow: 
        0 4px 6px rgba(59, 130, 246, 0.1),
        0 10px 20px rgba(59, 130, 246, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }
    
    .speech-bubble.typing-password {
      border-color: #ef4444;
      box-shadow: 
        0 4px 6px rgba(239, 68, 68, 0.1),
        0 10px 20px rgba(239, 68, 68, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }
    
    .speech-bubble::before {
      content: '';
      position: absolute;
      top: -18px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 18px solid transparent;
      border-right: 18px solid transparent;
      border-bottom: 18px solid #e0f2fe;
      transition: border-bottom-color 0.3s ease;
    }
    
    .speech-bubble.typing-email::before {
      border-bottom-color: #3b82f6;
    }
    
    .speech-bubble.typing-password::before {
      border-bottom-color: #ef4444;
    }
    
    .speech-bubble::after {
      content: '';
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 15px solid transparent;
      border-right: 15px solid transparent;
      border-bottom: 15px solid #ffffff;
    }
    
    .speech-bubble.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    
    .bubble-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .bubble-icon {
      font-size: 28px;
      line-height: 1;
      flex-shrink: 0;
      animation: iconPulse 2s ease-in-out infinite;
    }
    
    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    
    .bubble-text {
      margin: 0;
      color: #1e293b;
      font-size: 15px;
      font-weight: 500;
      line-height: 1.5;
      text-align: left;
      flex: 1;
    }
    
    @media (max-width: 640px) {
      .animated-character {
        width: 240px;
        height: 240px;
      }
      
      .speech-bubble {
        max-width: 280px;
        padding: 16px 24px;
      }
      
      .bubble-text {
        font-size: 14px;
      }
      
      .bubble-icon {
        font-size: 24px;
      }
    }
  `]
})
export class AnimatedCharacterComponent {
  @Input() isTypingEmail = false;
  @Input() isTypingPassword = false;
  
  showMessage = false;
  message = '';

  ngOnChanges() {
    // Sin mensajes - diseño profesional y limpio
    this.showMessage = false;
  }

  getMouthPath(): string {
    // Boca profesional neutral
    return 'M 125 125 Q 140 127, 155 125';
  }

  getBubbleIcon(): string {
    return '';
  }
}
