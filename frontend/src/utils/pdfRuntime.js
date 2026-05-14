const PDFJS_MODULE_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";

let pdfJsPromise = null;

export async function loadPdfJs() {
  if (!pdfJsPromise) {
    const dynamicImport = new Function("moduleUrl", "return import(moduleUrl);");

    pdfJsPromise = dynamicImport(PDFJS_MODULE_URL).then((module) => {
      const pdfjs = module?.default || module;
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return pdfjs;
    });
  }

  return pdfJsPromise;
}
