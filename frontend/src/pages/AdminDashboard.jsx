{/* =====================================================
    COMPLAINT DETAILS MODAL
===================================================== */}

{selectedComplaint && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#020b18]/80 p-3 backdrop-blur-md sm:p-5">

    <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

      {/* =================================================
          MODAL HEADER
      ================================================= */}

      <div className="shrink-0 border-b bg-white px-5 py-5 sm:px-7">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FaClipboardList />
            </div>

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Complaint Details
              </p>

              <h3 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                Complaint #{selectedComplaint.id}
              </h3>

            </div>

          </div>

          <button
            type="button"
            onClick={() => setSelectedComplaint(null)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-red-100 hover:text-red-600"
          >
            <FaTimes />
          </button>

        </div>

        {/* 🔥 DEFINITIVE TEST */}
        <div className="mt-4 rounded-xl bg-red-600 p-4 text-center text-lg font-black text-white shadow-lg">
          🔥 ADMIN TEST — NEW MODAL CODE IS RUNNING 🔥
        </div>

      </div>

      {/* =================================================
          MODAL BODY
      ================================================= */}

      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">

        <div className="space-y-5">

          {/* =================================================
              COMPLAINT EVIDENCE
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-lg sm:p-6">

            <div className="mb-5 flex items-center justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-md">
                  <FaImage />
                </div>

                <div>

                  <p className="text-xs font-black uppercase tracking-wider text-blue-600">
                    Complaint Evidence
                  </p>

                  <h4 className="mt-1 text-xl font-extrabold text-slate-900">
                    Uploaded Complaint Image
                  </h4>

                </div>

              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black text-blue-700">
                IMAGE
              </span>

            </div>

            {/* DIRECT BACKEND IMAGE */}

            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white p-3 shadow-xl">

              <div className="mb-3 rounded-xl bg-slate-900 px-4 py-3 text-center text-xs font-bold text-white">
                Complaint Evidence Image
              </div>

              <img
                src="http://localhost:5000/uploads/1791111439178-710375149.jpeg"
                alt="Complaint Evidence"
                className="block min-h-[280px] max-h-[520px] w-full rounded-xl bg-slate-100 object-contain"
                onLoad={() => {
                  console.log(
                    "✅ ADMIN COMPLAINT IMAGE LOADED"
                  );
                }}
                onError={(event) => {
                  console.error(
                    "❌ ADMIN COMPLAINT IMAGE FAILED"
                  );

                  console.error(
                    event
                  );
                }}
              />

            </div>

            {/* IMAGE URL FOR DEBUGGING */}

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">

              <p className="text-[10px] font-black uppercase text-blue-600">
                Image Source
              </p>

              <p className="mt-1 break-all text-xs font-semibold text-slate-600">
                http://localhost:5000/uploads/1791111439178-710375149.jpeg
              </p>

            </div>

          </section>

          {/* =================================================
              CITIZEN INFORMATION
          ================================================= */}

          <section className="rounded-2xl border bg-slate-50 p-5">

            <div className="mb-4 flex items-center gap-2">

              <FaUser className="text-blue-600" />

              <h4 className="font-extrabold">
                Citizen Information
              </h4>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Name
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {selectedComplaint.name ||
                    "Not available"}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all font-bold text-slate-900">
                  {selectedComplaint.email ||
                    "Not available"}
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              COMPLAINT INFORMATION
          ================================================= */}

          <section className="rounded-2xl border p-5">

            <div className="mb-4 flex items-center gap-2">

              <FaClipboardList className="text-blue-600" />

              <h4 className="font-extrabold">
                Complaint Information
              </h4>

            </div>

            <div className="space-y-4">

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Category
                </p>

                <p className="mt-1 font-bold">
                  {selectedComplaint.category ||
                    "Other"}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Description
                </p>

                <p className="mt-1 leading-7 text-slate-700">
                  {selectedComplaint.description ||
                    "No description available."}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyle(
                    selectedComplaint.status
                  )}`}
                >
                  {normalizeStatus(
                    selectedComplaint.status
                  )}
                </span>

              </div>

            </div>

          </section>

          {/* =================================================
              LOCATION & DEPARTMENT
          ================================================= */}

          <section className="rounded-2xl border p-5">

            <div className="mb-4 flex items-center gap-2">

              <FaMapMarkerAlt className="text-red-500" />

              <h4 className="font-extrabold">
                Location & Department
              </h4>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Location
                </p>

                <p className="mt-1 font-bold">
                  {selectedComplaint.location ||
                    "Location not available"}
                </p>

              </div>

              <div>

                <p className="text-xs uppercase text-slate-400">
                  Department
                </p>

                <p className="mt-1 font-bold">
                  {selectedComplaint.department ||
                    "Not Assigned"}
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              ADMINISTRATIVE ACTION
          ================================================= */}

          <section className="rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50/80 to-cyan-50/50 p-5 sm:p-6">

            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Administrative Action
            </p>

            <h4 className="mt-1 text-xl font-extrabold">
              Manage Complaint
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Update status, assignment and resolution details.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-bold">
                  Complaint Status
                </label>

                <select
                  value={updateStatus}
                  onChange={(e) =>
                    setUpdateStatus(
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border bg-white px-4 font-semibold"
                >

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Resolved">
                    Resolved
                  </option>

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold">
                  Assigned To
                </label>

                <input
                  value={assignedTo}
                  onChange={(e) =>
                    setAssignedTo(
                      e.target.value
                    )
                  }
                  placeholder="Department / Officer"
                  className="h-12 w-full rounded-xl border bg-white px-4"
                />

              </div>

            </div>

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold">

                Resolution Note

                {updateStatus ===
                  "Resolved" && (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                )}

              </label>

              <textarea
                rows="4"
                value={resolutionNote}
                onChange={(e) =>
                  setResolutionNote(
                    e.target.value
                  )
                }
                placeholder="Enter resolution details..."
                className="w-full resize-none rounded-xl border bg-white p-4"
              />

            </div>

            {updateMessage && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">

                <FaCheckCircle className="mr-2 inline" />

                {updateMessage}

              </div>
            )}

            {updateError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {updateError}
              </div>
            )}

            <button
              type="button"
              onClick={updateComplaint}
              disabled={updating}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b5cab] px-5 py-3.5 font-bold text-white disabled:opacity-60"
            >

              {updating ? (
                <>
                  <FaSpinner className="animate-spin" />

                  Updating Complaint...
                </>
              ) : (
                <>
                  <FaCheckCircle />

                  Update Complaint
                </>
              )}

            </button>

          </section>

          {/* =================================================
              CLOSE
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setSelectedComplaint(null)
            }
            className="w-full rounded-xl bg-slate-900 py-3.5 font-bold text-white transition hover:bg-slate-800"
          >
            Close Details
          </button>

        </div>

      </div>

    </div>

  </div>
)}