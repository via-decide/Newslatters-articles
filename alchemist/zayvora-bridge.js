(function (global) {
  const bridge = {
    async analyzePage(content) {
      const text = String(content || '').replace(/\s+/g, ' ').trim();
      const words = text.split(' ').filter(Boolean);
      const summary = words.slice(0, 60).join(' ') + (words.length > 60 ? '…' : '');
      const concepts = ['Problem', 'Approach', 'Evidence', 'Opportunity']
        .filter((_, index) => words.length > index * 30)
        .map((label, index) => `${label}: ${words.slice(index * 10, (index * 10) + 6).join(' ') || 'N/A'}`);

      return {
        summary: summary || 'No content available for analysis.',
        keyConcepts: concepts,
        toolIdeas: ['Generate a checklist app', 'Build a summarizer workflow', 'Create a concept quiz'],
        gameIdeas: ['Flashcard challenge', 'Timeline reconstruction game', 'Argument-mapping puzzle']
      };
    }
  };

  global.ZayvoraBridge = bridge;
})(window);
