import { useState } from "react";
import jsPDF from "jspdf";

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
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFetch = async () => {
    setError("");
    setProjectData([]);
    setLoading(true);

    const trimmedId = userId.trim();
    if (!trimmedId || isNaN(Number(trimmedId))) {
      setError("❌ Please enter a valid numeric Client ID.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/getProject/${trimmedId}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setProjectData(data);
    } catch (err: any) {
      console.error("❌ Fetch error:", err);
      setError("❌ Could not fetch project. " + (err.message || ""));
    }

    setLoading(false);
  };

  const handleDownload = async (project: Project) => {
    try {
      const pdf = new jsPDF();
      pdf.setFontSize(26);
      pdf.setFont("helvetica", "bold");
      pdf.text("VIDWAT", 105, 20, { align: "center" });

      pdf.setFontSize(14);
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
      const labelStyle = () => pdf.setFont("helvetica", "bold");
      const valueStyle = () => pdf.setFont("helvetica", "normal");

      const printRow = (label: string, value: string | number) => {
        labelStyle();
        pdf.text(label, 20, y);
        valueStyle();
        pdf.text(String(value), 60, y);
        y += 10;
      };

      printRow("Client ID:", project.projectClientID);
      printRow("Client Name:", project.projectClientName);
      printRow("Contact Number:", project.projectContactNumber);
      printRow("Address:", project.projectAddress);
      printRow("Project Name:", project.projectName);
      printRow("Project Type:", project.projectType);
      printRow("Meeting Date:", new Date(project.projectTime).toLocaleString());

      y += 10;
      pdf.setFont("helvetica", "bold");
      pdf.text("Description:", 20, y);

      const descText = pdf.splitTextToSize(
        project.projectDescription || "-",
        160
      );
      const descHeight = descText.length * 7 + 5;
      pdf.rect(20, y + 2, 170, descHeight, "S");
      pdf.setFont("helvetica", "normal");
      pdf.text(descText, 25, y + 10);
      y += descHeight + 12;

      if (project.projectMeetingOutcome?.trim()) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Meeting Outcome:", 20, y);
        const outcomeText = pdf.splitTextToSize(
          project.projectMeetingOutcome,
          160
        );
        const outHeight = outcomeText.length * 7 + 5;
        pdf.rect(20, y + 2, 170, outHeight, "S");
        pdf.setFont("helvetica", "normal");
        pdf.text(outcomeText, 25, y + 10);
        y += outHeight + 12;
      }

      if (project.projectworked?.trim()) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Points to be Worked:", 20, y);
        const bulletPoints = project.projectworked
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        let currentY = y + 10;
        const lines = bulletPoints.flatMap((point) =>
          pdf.splitTextToSize(point, 150)
        );
        const boxHeight = lines.length * 7 + 12;

        pdf.rect(20, y + 8, 170, boxHeight, "S");
        pdf.setFont("helvetica", "normal");
        lines.forEach((line, index) => {
          const prefix = index === 0 ? "• " : "   ";
          pdf.text(prefix + line, 25, currentY);
          currentY += 7;
        });

        y += boxHeight + 12;
      }

      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFont("helvetica", "bold");
      pdf.text("Sign of Consultant", 20, pageHeight - 20);
      pdf.text("Sign of Client", 150, pageHeight - 20);

      pdf.save(`${project.projectName}_${Date.now()}.pdf`);

      showNotification("success", "✅ PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      showNotification("error", "❌ Failed to download PDF.");
    }
  };

  const handleWhatsAppShare = (project: Project) => {
    const confirmSend = window.confirm(
      "Do you want to send this project summary via WhatsApp?"
    );
    if (!confirmSend) return;

    let phone = project.projectContactNumber.trim();
    if (!phone.startsWith("+")) {
      phone =
        phone.length === 10
          ? "+91" + phone
          : phone.length === 12
          ? "+" + phone
          : phone;
    }

    if (!/^\+\d{10,15}$/.test(phone)) {
      alert("❌ Invalid phone number.");
      return;
    }

    const msg = `
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
    ? `\n*Meeting Outcome:*  \n${project.projectMeetingOutcome}`
    : ""
}

──────────────────────────
*Report Generated By:* VIDWAT Team  
Vijayapur
    `.trim();

    const link = `https://wa.me/${phone.replace(
      "+",
      ""
    )}?text=${encodeURIComponent(msg)}`;
    const win = window.open(link, "_blank");
    if (!win) {
      alert(
        "⚠️ Pop-up blocked! Please allow pop-ups for this site in your browser."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-300 to-purple-300 p-8 flex justify-center items-center relative">
      {notification && (
        <div
          className={`fixed top-5 right-5 px-4 py-3 rounded shadow-lg text-white transition-opacity duration-500 ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}

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
          onChange={(e) => setUserId(e.target.value.trim())}
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
                className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-2"
              >
                <p>
                  <strong>Name:</strong> {project.projectClientName}
                </p>
                <p>
                  <strong>Phone:</strong> {project.projectContactNumber}
                </p>
                <p>
                  <strong>Client ID:</strong> {project.projectClientID}
                </p>
                <p>
                  <strong>Project Name:</strong> {project.projectName}
                </p>
                <p>
                  <strong>Project Type:</strong> {project.projectType}
                </p>
                <p>
                  <strong>Meeting Time:</strong>{" "}
                  {new Date(project.projectTime).toLocaleString()}
                </p>
                <p>
                  <strong>Address:</strong> {project.projectAddress}
                </p>
                <p>
                  <strong>Description:</strong> {project.projectDescription}
                </p>
                {project.projectMeetingOutcome && (
                  <p>
                    <strong>Outcome:</strong> {project.projectMeetingOutcome}
                  </p>
                )}
                {project.projectworked && (
                  <p>
                    <strong>Points to be worked:</strong>{" "}
                    {project.projectworked}
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
