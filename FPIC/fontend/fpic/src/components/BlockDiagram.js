import React, { useState } from "react";
import { Col } from "react-bootstrap";
const PDFViewer = () => {
  const [showModal, setShowModal] = useState(false);
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
      <Col md={2} className="text-end">
        <button class="animated-button">
          <svg
            viewBox="0 0 20 20"
            className="arr-2 mt-1 "
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
          </svg>
          <span class="text"> Thêm mẫu sơ đồ khối</span>
          <span class="circle"></span>
          <svg
            viewBox="0 0 20 20"
            className="arr-1 mt-1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
          </svg>
        </button>
      </Col>

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
