(function (global) {
  async function generateTool(insight) {
    return {
      workflow: 'logichub://generate-tool',
      preview: `Prototype for: ${insight.summary.slice(0, 90)}`
    };
  }

  function publishInsight(insight) {
    return {
      category: '/insights',
      fields: {
        title: 'Generated Insight',
        summary: insight.summary,
        creator: 'Daxini user',
        generated_by: 'alchemist'
      }
    };
  }

  global.AlchemistActions = {
    generateTool,
    publishInsight
  };
})(window);
