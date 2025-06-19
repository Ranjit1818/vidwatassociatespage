import { useState } from "react";

const UpdateProject = () => {
  const [clientId, setClientId] = useState("");
  const [existingData, setExistingData] = useState(null);
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    address: "",
    meetingDate: "",
    meetingOutcome: "",
    pointsToBeWorked: "",
  });
  const [notFound, setNotFound] = useState(false);

  const handleClientIdSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`getProject/${clientId}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setExistingData(data[0]);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching project.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/cloneAndAddProject/${clientId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName:
              formData.projectName || existingData.projectName + " - Update",
            projectDescription: formData.projectDescription,
            projectTime: new Date(formData.meetingDate).toISOString(),
            projectAddress: formData.address,
            projectMeetingOutcome: formData.meetingOutcome,
            projectworked: formData.pointsToBeWorked,
          }),
        }
      );

      const result = await res.json();
      if (result.success) {
        alert("✅ New project added (based on existing one)!");
        setFormData({
          projectName: "",
          projectDescription: "",
          address: "",
          meetingDate: "",
          meetingOutcome: "",
          pointsToBeWorked: "",
        });
        setExistingData(null);
        setClientId("");
      } else {
        alert("❌ Failed to add new project.");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          🔄 Add New Project Based on Existing Client
        </h2>

        {!existingData && (
          <form onSubmit={handleClientIdSubmit} className="space-y-4">
            <input
              type="number"
              name="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter Client ID"
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
            >
              Fetch Project
            </button>
            {notFound && (
              <p className="text-red-600 font-semibold text-center">
                No project found with that Client ID.
              </p>
            )}
          </form>
        )}

        {existingData && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4">
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="New Project Name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="datetime-local"
              name="meetingDate"
              value={formData.meetingDate}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <textarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              placeholder="Project Description"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Updated Address"
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <textarea
              name="meetingOutcome"
              value={formData.meetingOutcome}
              onChange={handleChange}
              placeholder="Meeting Outcome"
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <textarea
              name="pointsToBeWorked"
              value={formData.pointsToBeWorked}
              onChange={handleChange}
              placeholder="Points to be Worked"
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
            >
              Add as New Project
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateProject;
