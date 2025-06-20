import { useState } from "react";

const AddProject = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    clientId: "",
    projectName: "",
    projectType: "",
    description: "",
    time: "",
    address: "",
    outcome: "",
    Points_to_be_Worked: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/addProject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: formData.projectName,
            projectClientID: parseInt(formData.clientId, 10),
            projectClientName: formData.name,
            projectContactNumber: formData.phone,
            projectType: formData.projectType,
            projectDescription: formData.description,
            projectTime: new Date(formData.time).toISOString(),
            projectAddress: formData.address,
            projectMeetingOutcome: formData.outcome || null,
            projectworked: formData.Points_to_be_Worked,
          }),
        }
      );

      console.log("Response status:", res.status); // 🔍
      const result = await res.json(); // might fail if not JSON!
      console.log("Response JSON:", result); // 🔍

      if (result.success) {
        alert("✅ Project submitted successfully!");
        setFormData({
          name: "",
          phone: "",
          clientId: "",
          projectName: "",
          projectType: "",
          description: "",
          time: "",
          address: "",
          outcome: "",
          Points_to_be_Worked: "",
        });
      } else {
        alert("❌ Submission failed.");
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      alert("❌ Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-yellow-200 via-red-300 to-pink-300 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Vidwat Associates
        </h1>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          📥 Add New Project
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Client Name"
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number (10 digits)"
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            placeholder="Client ID (number)"
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="Project Name"
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="projectType"
            value={formData.projectType}
            onChange={handleChange}
            placeholder="Project Type "
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Project Description"
            required
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="datetime-local"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <textarea
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            placeholder="Meeting Outcome (optional)"
            rows={2}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />

          <textarea
            name="Points_to_be_Worked"
            value={formData.Points_to_be_Worked}
            onChange={handleChange}
            placeholder="points to be worked"
            rows={2}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-bold hover:from-blue-600 hover:to-purple-600 transition"
          >
            Submit Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProject;
