export const printDocumentInIframe = (url) => {
  const existingIframe = document.getElementById('print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }
  const iframe = document.createElement('iframe');
  iframe.id = 'print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);
  iframe.src = url;
};
