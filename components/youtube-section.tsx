"use client"

import { useState } from "react"

export function YouTubeSection() {
  // ใส่ YouTube Video ID ตรงนี้ (ตัวอย่าง: "dQw4w9WgXcQ" จาก URL: youtube.com/watch?v=dQw4w9WgXcQ)
  const videos = [
    {
      id: 1,
      videoId: "Y_rbhjwqqAA", // ⬅️ ใส่ YouTube Video ID ตรงนี้
      title: "BittleX ep2",
      thumbnail: "" // จะใช้ YouTube thumbnail อัตโนมัติ
    },
    {
      id: 2,
      videoId: "nVR0HtS3gf4", // ⬅️ ใส่ YouTube Video ID ตรงนี้
      title: "OnShape EP1 : มาสร้างพวงกุญแจ 3 มิติกันเถอะ",
      thumbnail: ""
    },
    {
      id: 3,
      videoId: "vYZuUnm4uBo", // ⬅️ ใส่ YouTube Video ID ตรงนี้
      title: "MiniBorot EP1: Introduction to MiniBorot",
      thumbnail: ""
    }
  ]

  return (
    <section
      className="w-full flex flex-col items-center gap-8 px-4 md:px-8 lg:px-[100px] py-12 md:py-[72px]"
      style={{
        background: "#FFFFFF",
        fontFamily: 'var(--font-geist-sans), "IBM Plex Sans Thai", sans-serif',
      }}
    >
      {/* Header */}
      <div className="w-full max-w-[1440px] text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          <span style={{ color: "#101010" }}>YouTube </span>
          <span style={{ color: "#E5690D" }}>Chanal</span>
        </h2>
        <p
          className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed"
          style={{ color: "#484848" }}
        >
          ติดตามเนื้อหาและผลงานของผู้เข้าร่วมโครงการผ่าน YouTube Channel
        </p>
      </div>

      {/* Video Grid */}
      <div className="w-full max-w-[1440px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex flex-col gap-4 rounded-2xl overflow-hidden transition-transform hover:scale-[1.02]"
            style={{
              background: "#F5F5F5",
              border: "1px solid #E0E0E0",
            }}
          >
            {/* Video Player Area */}
            <div
              className="w-full bg-gray-300 relative overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              {video.videoId ? (
                // แสดง YouTube Embed เมื่อมี Video ID
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.videoId}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // Placeholder เมื่อยังไม่มี Video ID
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium">YouTube Video</p>
                  <p className="text-xs mt-1">ใส่ Video ID</p>
                </div>
              )}
            </div>

            {/* Video Title */}
            <div className="px-6 pb-6">
              <h3
                className="text-base md:text-lg font-semibold"
                style={{ color: "#101010" }}
              >
                {video.title}
              </h3>
              
              {/* ปุ่มดูใน YouTube (แสดงเมื่อมี videoId) */}
              {video.videoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "#E5690D" }}
                >
                  <span>ดูที่ YouTube</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="w-full max-w-[1440px] flex justify-center mt-4">
        <a
          href="https://youtube.com/@borot.Official" // ⬅️ ใส่ลิงก์ YouTube Channel ตรงนี้
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
          style={{
            background: "#E5690D",
            color: "#FFFFFF",
          }}
        >
          <span>ดู Channel ทั้งหมด</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </div>
    </section>
  )
}