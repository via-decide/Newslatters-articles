(function (global) {
  function downloadText(filename, content) {
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  global.AlchemistPdfExport = {
    exportReport(payload) {
      const body = JSON.stringify(payload, null, 2);
      downloadText('alchemist-report.pdf', body);
    }
  };
})(window);
