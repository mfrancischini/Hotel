/**
 * Ejemplo de uso del chatbot
 * Demuestra cómo integrar el chatbot en tu aplicación
 */

import chatbot from './app';
import logger from './utils/logger';

/**
 * Ejemplo de conversación simulada
 */
async function runExample(): Promise<void> {
  try {
    // Inicializar chatbot
    await chatbot.initialize();

    const userId = 'user_123';
    const conversations = [
      'Hola',
      'Quiero hacer una reserva',
      'Juan García López',
      '15/12/2024',
      '18/12/2024',
      '2',
      '2',
      'Ninguno',
      'Sí',
    ];

    console.log('\n' + '='.repeat(60));
    console.log('EJEMPLO DE CONVERSACIÓN CON EL CHATBOT');
    console.log('='.repeat(60) + '\n');

    for (let i = 0; i < conversations.length; i++) {
      const message = conversations[i];

      console.log(`👤 Usuario: ${message}`);

      const response = await chatbot.processMessage(userId, message);

      console.log(`🤖 Bot: ${response.content}`);
      console.log('-'.repeat(60));

      // Pequeña pausa entre mensajes
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Mostrar estadísticas
    console.log('\n' + '='.repeat(60));
    console.log('ESTADÍSTICAS DEL CHATBOT');
    console.log('='.repeat(60));

    const stats = chatbot.getStats();
    console.log(JSON.stringify(stats, null, 2));

    // Mostrar contexto del usuario
    console.log('\n' + '='.repeat(60));
    console.log('CONTEXTO DEL USUARIO');
    console.log('='.repeat(60));

    const userContext = chatbot.getUserContext(userId);
    if (userContext) {
      console.log('Flujo actual:', userContext.currentFlow);
      console.log('Sentimiento:', userContext.sentiment);
      console.log('Escalado:', userContext.isEscalated);
      console.log('Mensajes en historial:', userContext.conversationHistory.length);
      console.log(
        'Datos de reserva:',
        JSON.stringify(userContext.reservationData, null, 2),
      );
    }

    // Mostrar estado de salud
    console.log('\n' + '='.repeat(60));
    console.log('ESTADO DE SALUD DEL SISTEMA');
    console.log('='.repeat(60));

    const health = chatbot.getHealthStatus();
    console.log(JSON.stringify(health, null, 2));
  } catch (error) {
    logger.error('Error en ejemplo', { error: String(error) });
    console.error('Error:', error);
  }
}

// Ejecutar ejemplo
if (require.main === module) {
  runExample().catch(console.error);
}

export { runExample };
