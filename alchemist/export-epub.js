(function (global) {
  function downloadText(filename, content) {
    const blob = new Blob([content], { type: 'application/epub+zip' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  global.AlchemistEpubExport = {
    exportSession(payload) {
      const body = JSON.stringify(payload, null, 2);
      downloadText('alchemist-session.epub', body);
    }
  };
})(window);
