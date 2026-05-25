import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useThemeStore } from "../store/useThemeStore";
import { X, Camera, Search, Users, Check } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupModal = ({ onClose }) => {
  const { theme } = useThemeStore();
  const { users, createGroup } = useChatStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupPic, setGroupPic] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupPic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setIsSubmitting(true);
    try {
      await createGroup({
        name,
        description,
        members: selectedMembers,
        groupPic,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh] ${
          isDark ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Modal Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-gray-800" : "border-gray-100"}`}>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h3 className="text-lg font-bold">Create New Group</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer ${
              isDark ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div
                className={`w-24 h-24 rounded-full border-2 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                {groupPic ? (
                  <img src={groupPic} alt="Group Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Users className="size-10 text-gray-400" />
                )}
              </div>
              <label
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary hover:bg-primary-focus text-white cursor-pointer shadow-lg hover:scale-105 transition-all duration-150"
                title="Upload Group Photo"
              >
                <Camera className="size-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <span className="text-xs text-gray-500 mt-2">Upload group photo (optional)</span>
          </div>

          {/* Group Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Group Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project Avengers"
                className="w-full input input-bordered rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group about?"
                rows={2}
                className="w-full textarea textarea-bordered rounded-xl text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Members Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Select Members *</label>
              <span className="text-xs text-zinc-500 font-medium">
                {selectedMembers.length} selected
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full input input-bordered input-sm rounded-xl pl-10 text-xs"
              />
            </div>

            {/* Contacts Scroll Tray */}
            <div className={`border rounded-xl max-h-48 overflow-y-auto divide-y ${
              isDark ? "border-gray-800 divide-gray-800" : "border-gray-200 divide-gray-100"
            }`}>
              {filteredUsers.map((user) => {
                const isSelected = selectedMembers.includes(user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => handleToggleMember(user._id)}
                    className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                      isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="text-sm font-medium">{user.fullName}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : isDark
                          ? "border-gray-700 bg-gray-900"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3px]" />}
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center text-xs text-zinc-500 py-6">
                  No contacts found.
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t dark:border-gray-800 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost rounded-xl text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-xl text-sm shadow-md"
              disabled={isSubmitting || !name.trim() || selectedMembers.length === 0}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
