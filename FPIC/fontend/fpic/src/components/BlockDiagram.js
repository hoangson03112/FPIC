import React from "react";

const PDFViewer = () => {
  const pdfFiles = [
    { id: 1, url: "/j.pdf", name: "LS1043ARDB-PC-DDR" },
    { id: 2, url: "/i.pdf", name: "Main Board FPGA " },
    {
      id: 3,
      url: "/compal_la-7901p_r1.0_schematics.pdf",
      name: "Korbel 14 UMA--Non vPRO ",
    },
  ];

  return (
    <div className="container-fluid">
      <div className="row">
        {pdfFiles.map((file) => (
          <div key={file.id} className="col-md-6 mb-4 mt-4">
            <div className="card">
              <div className="card-body">
                <div style={{ height: "600px" }}>
                  <object
                    data={file.url}
                    type="application/pdf"
                    className="w-100 h-100"
                  >
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Trình duyệt không hỗ trợ xem PDF
                    </div>
                  </object>
                </div>
                <div className="text-center mt-3">
                  <strong>{file.name}</strong>
                  <button
                    className="btn btn-outline-primary btn-sm w-auto ms-2"
                    onClick={() => window.open(file.url, "_blank")}
                  >
                    Xem
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;
