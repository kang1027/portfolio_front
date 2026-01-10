import { useState } from "react";

const Contact = () => {
  const dark = useStore((state) => state.dark);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    message: ""
  });

  const validateForm = (): boolean => {
    const errors = {
      name: "",
      email: "",
      message: ""
    };

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }

    setValidationErrors(errors);
    return !errors.name && !errors.email && !errors.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationErrors({ name: "", email: "", message: "" });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setIsSubmitting(false);
      setSubmitStatus("success");

      // Reset form after success
      setTimeout(() => {
        setFormData({ name: "", email: "", message: "" });
        setSubmitStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Failed to submit form:", error);
      setIsSubmitting(false);
      setSubmitStatus("error");

      // Reset error status after 3 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error for this field when user types
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ""
      });
    }
  };

  return (
    <div className="h-full flex flex-col" bg="white dark:gray-900">
      {/* Header */}
      <div className="px-8 py-6 border-b" bg="gray-100 dark:gray-800" border="c-300">
        <h1 className="text-3xl font-semibold" text="gray-900 dark:white">
          Contact Me
        </h1>
        <p className="mt-2 text-sm" text="gray-600 dark:gray-400">
          외주 문의, 커피챗, 상담 등 자유롭게 적어서 보내주세요. 빠른 시일 내에 기입된
          이메일로 답변 드리겠습니다.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto px-8 py-6" bg="white dark:gray-900">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Name Field */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
              text="gray-700 dark:gray-300"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border transition-all outline-none focus:ring-2 ${
                validationErrors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-c-300 focus:ring-blue-500"
              }`}
              bg="white dark:gray-800"
              text="gray-900 dark:white"
              placeholder="Your name"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              text="gray-700 dark:gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border transition-all outline-none focus:ring-2 ${
                validationErrors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-c-300 focus:ring-blue-500"
              }`}
              bg="white dark:gray-800"
              text="gray-900 dark:white"
              placeholder="your.email@example.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-sm font-medium mb-2"
              text="gray-700 dark:gray-300"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={8}
              className={`w-full px-4 py-3 rounded-lg border transition-all outline-none focus:ring-2 resize-none ${
                validationErrors.message
                  ? "border-red-500 focus:ring-red-500"
                  : "border-c-300 focus:ring-blue-500"
              }`}
              bg="white dark:gray-800"
              text="gray-900 dark:white"
              placeholder="Your message..."
            />
            {validationErrors.message && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {validationErrors.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              bg="blue-500 hover:blue-600"
              text="white"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>

            {submitStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Message sent successfully!</span>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Failed to send message</span>
              </div>
            )}
          </div>

          {/* Additional Contact Info */}
          <div className="mt-12 pt-8 border-t" border="c-300">
            <h2 className="text-lg font-semibold mb-4" text="gray-900 dark:white">
              Other Ways to Connect
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="mailto:your-email@example.com"
                className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md"
                bg="white dark:gray-800"
                border="c-300 hover:blue-300"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  bg="blue-100 dark:blue-900"
                >
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium" text="gray-900 dark:white">
                    Email
                  </div>
                  <div className="text-xs" text="gray-600 dark:gray-400">
                    Direct message
                  </div>
                </div>
              </a>

              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md"
                bg="white dark:gray-800"
                border="c-300 hover:gray-400"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  bg="gray-100 dark:gray-700"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium" text="gray-900 dark:white">
                    GitHub
                  </div>
                  <div className="text-xs" text="gray-600 dark:gray-400">
                    View projects
                  </div>
                </div>
              </a>

              <a
                href="https://instagram.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md"
                bg="white dark:gray-800"
                border="c-300 hover:pink-300"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  bg="pink-100 dark:pink-900"
                >
                  <svg
                    className="w-5 h-5 text-pink-600 dark:text-pink-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium" text="gray-900 dark:white">
                    Instagram
                  </div>
                  <div className="text-xs" text="gray-600 dark:gray-400">
                    Follow me
                  </div>
                </div>
              </a>

              <a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md"
                bg="white dark:gray-800"
                border="c-300 hover:sky-300"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  bg="sky-100 dark:sky-900"
                >
                  <svg
                    className="w-5 h-5 text-sky-600 dark:text-sky-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium" text="gray-900 dark:white">
                    Twitter
                  </div>
                  <div className="text-xs" text="gray-600 dark:gray-400">
                    Connect online
                  </div>
                </div>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
