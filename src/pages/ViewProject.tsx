import { useState } from "react";
import jsPDF from "jspdf";

// Define Project type matching your schema
type Project = {
  projectId: number;
  projectName: string;
  projectClientID: number;
  projectClientName: string;
  projectContactNumber: string;
  projectType: string;
  projectDescription: string;
  projectTime: string;
  projectAddress: string;
  projectMeetingOutcome?: string | null;
  projectworked: string | null;
};

const ViewProject = () => {
  const [userId, setUserId] = useState("");
  const [projectData, setProjectData] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setError("");
    setProjectData([]);
    setLoading(true);

    if (!userId || isNaN(Number(userId))) {
      setError("❌ Please enter a valid numeric Client ID.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `https://backend.vidwat.workers.dev/api/getProject/${userId}`
      );
      if (!res.ok) throw new Error("Project not found");

      const data = await res.json();
      setProjectData(data);
    } catch (err) {
      setError("❌ Could not fetch project. Make sure the ID is correct.");
    }

    setLoading(false);
  };

  const handleDownload = async (project: Project) => {
    try {
      const pdf = new jsPDF();

      // 🟩 Header
      pdf.setFontSize(26);
      pdf.setFont("helvetica", "bold");
      pdf.text("VIDWAT", 105, 20, { align: "center" });

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Architects and Engineers", 105, 30, { align: "center" });

      pdf.setFontSize(12);
      pdf.text(
        "#33, Opp Milan Petrol Pump, Near Veer Savarkar Circle, Begum Talab Road, Vijayapur",
        105,
        38,
        { align: "center" }
      );

      pdf.setLineWidth(0.3);
      pdf.line(20, 45, 190, 45);

      let y = 55;

      const labelStyle = () => {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
      };
      const valueStyle = () => {
        pdf.setFont("helvetica", "normal");
      };
      const printRow = (label: string, value: string | number) => {
        labelStyle();
        pdf.text(label, 20, y);
        valueStyle();
        pdf.text(String(value), 60, y);
        y += 10;
      };

      // 🟨 Metadata
      printRow("Client ID:", project.projectClientID);
      printRow("Client Name:", project.projectClientName);
      printRow("Contact Number:", project.projectContactNumber);
      printRow("Address:", project.projectAddress);
      printRow("Project Name:", project.projectName);
      printRow("Project Type:", project.projectType);
      printRow("Meeting Date:", new Date(project.projectTime).toLocaleString());

      // 🟦 Description
      y += 10;
      pdf.setFont("helvetica", "bold");
      pdf.text("Description:", 20, y);

      const descText = pdf.splitTextToSize(
        project.projectDescription || "-",
        160
      );
      const descBoxHeight = descText.length * 7 + 5;
      const descBoxTop = y + 2;

      pdf.setDrawColor(80);
      pdf.setLineWidth(0.2);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(20, descBoxTop, 170, descBoxHeight, "S");

      pdf.setFont("helvetica", "normal");
      pdf.text(descText, 25, descBoxTop + 8);

      y = descBoxTop + descBoxHeight + 10;

      // 🟪 Meeting Outcome Section
      if (project.projectMeetingOutcome) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Meeting Outcome:", 20, y);

        const outcomeText = pdf.splitTextToSize(
          project.projectMeetingOutcome || "-",
          160
        );
        const outcomeBoxHeight = outcomeText.length * 7 + 5;
        const outcomeBoxTop = y + 2;

        pdf.setDrawColor(80);
        pdf.setLineWidth(0.2);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(20, outcomeBoxTop, 170, outcomeBoxHeight, "S");

        pdf.setFont("helvetica", "normal");
        pdf.text(outcomeText, 25, outcomeBoxTop + 8);

        y = outcomeBoxTop + outcomeBoxHeight + 10;
      }
      // 🟫 Points to be Worked (bullet list)
      if (project.projectworked) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Points to be Worked:", 20, y);

        const bulletPoints = project.projectworked
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        const bulletYStart = y + 8;
        let currentY = bulletYStart + 6; // 🔹 Add vertical padding inside box

        let totalLines: string[][] = [];

        // Collect all wrapped lines for calculating box height
        bulletPoints.forEach((point) => {
          const wrappedLines = pdf.splitTextToSize(point, 150);
          totalLines.push(wrappedLines);
        });

        // Calculate height of box with vertical padding (top+bottom = 12)
        const totalHeight =
          totalLines.reduce((sum, lines) => sum + lines.length * 7, 0) + 12;

        // Draw rectangle box (with padding)
        pdf.setDrawColor(80);
        pdf.setLineWidth(0.2);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(20, bulletYStart, 170, totalHeight, "S");

        // Render the bullet points inside the box with horizontal padding
        pdf.setFont("helvetica", "normal");
        totalLines.forEach((wrappedLines) => {
          wrappedLines.forEach((line, index) => {
            const prefix = index === 0 ? "• " : "   ";
            pdf.text(prefix + line, 25, currentY); // 🔹 25 gives left padding
            currentY += 7;
          });
        });

        y = bulletYStart + totalHeight + 10; // update y for next section
      }

      // Footer: Signature lines
      const pageHeight = pdf.internal.pageSize.height;

      pdf.setFont("helvetica", "bold");
      pdf.text("Sign of Consultant", 20, pageHeight - 20); // bottom-left
      pdf.text("Sign of Client", 150, pageHeight - 20); // bottom-right

      // 🔽 Save
      pdf.save(`${project.projectName || "project"}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("❌ Failed to download PDF.");
    }
  };

  const handleWhatsAppShare = (project: Project) => {
    const confirmSend = window.confirm(
      "Do you want to send this project summary via WhatsApp?"
    );
    if (!confirmSend) return;

    let phoneNumber = String(project.projectContactNumber).replace(/\s+/g, "");

    // Automatically normalize number to +91 if needed
    if (!phoneNumber.startsWith("+")) {
      if (phoneNumber.length === 10) phoneNumber = "+91" + phoneNumber;
      else if (phoneNumber.length === 12 && phoneNumber.startsWith("91"))
        phoneNumber = "+" + phoneNumber;
      else {
        alert("❌ Invalid contact number in project data.");
        return;
      }
    }

    if (!/^\+\d{10,15}$/.test(phoneNumber)) {
      alert("❌ Invalid phone number.");
      return;
    }

    // Construct the professional message
    const message = `
   *Project Summary Report*  
   *VIDWAT ASSOCIATES* – Architects & Engineers  
  ──────────────────────────
  
  *Client Name:* ${project.projectClientName}  
  *Contact Number:* ${project.projectContactNumber}  
  *Client ID:* ${project.projectClientID}  
  
  *Project Name:* ${project.projectName}  
  *Project Type:* ${project.projectType}  
  *Meeting Time:* ${new Date(project.projectTime).toLocaleString()}  
  
  *Address:*  
  ${project.projectAddress}  
  
  *Project Description:*  
  ${project.projectDescription || "-"}
  
  ${
    project.projectMeetingOutcome
      ? `\n *Meeting Outcome:*  \n${project.projectMeetingOutcome}`
      : ""
  }
  
 
  ──────────────────────────
   *Report Generated By:* VIDWAT Team  
   Vijayapur
  `;

    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${phoneNumber.replace(
      "+",
      ""
    )}?text=${encodedMessage}`;

    const win = window.open(waLink, "_blank");
    if (!win) {
      alert(
        "⚠️ Pop-up blocked! Please allow pop-ups for this site in your browser."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-300 to-purple-300 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Vidwat Associates
        </h1>
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
          🔍 View Project Details
        </h2>

        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter Client ID"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleFetch}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mb-4 hover:bg-blue-700"
        >
          Fetch Project
        </button>

        {loading && <p className="text-blue-600">⏳ Loading...</p>}
        {error && <p className="text-red-500 mb-2">{error}</p>}

        {projectData.length > 0 && (
          <div className="space-y-4">
            {projectData.map((project) => (
              <div
                key={project.projectId}
                className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-2 relative"
              >
                <p>
                  <strong className="text-gray-600">Name:</strong>{" "}
                  <span className="text-gray-800">
                    {project.projectClientName}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-600">Phone:</strong>{" "}
                  <span className="text-gray-800">
                    {project.projectContactNumber}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-600">Client ID:</strong>{" "}
                  <span className="text-gray-800">
                    {project.projectClientID}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-600">Project Name:</strong>{" "}
                  <span className="text-gray-800">{project.projectName}</span>
                </p>
                <p>
                  <strong className="text-gray-600">Project Type:</strong>{" "}
                  <span className="text-gray-800">{project.projectType}</span>
                </p>
                <p>
                  <strong className="text-gray-600">Meeting Time:</strong>{" "}
                  <span className="text-gray-800">
                    {new Date(project.projectTime).toLocaleString()}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-600">Address:</strong>{" "}
                  <span className="text-gray-800">
                    {project.projectAddress}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-600">Description:</strong>{" "}
                  <span className="text-gray-800">
                    {project.projectDescription}
                  </span>
                </p>
                {project.projectMeetingOutcome && (
                  <p>
                    <strong className="text-gray-600">Outcome:</strong>{" "}
                    <span className="text-gray-800">
                      {project.projectMeetingOutcome}
                    </span>
                  </p>
                )}
                {project.projectworked && (
                  <p>
                    <strong className="text-gray-600">Outcome:</strong>{" "}
                    <span className="text-gray-800">
                      {project.projectworked}
                    </span>
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleDownload(project)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    ⬇️ Download PDF
                  </button>
                  <button
                    onClick={() => handleWhatsAppShare(project)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    📲 Send to WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProject;
