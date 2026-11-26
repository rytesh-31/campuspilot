import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ProfileView: React.FC = () => {
  const { data, updateProfile } = useWorkspace();

  const [name, setName] = useState(data.profile.name);
  const [email, setEmail] = useState(data.profile.email);
  const [university, setUniversity] = useState(data.profile.university);
  const [major, setMajor] = useState(data.profile.major);
  const [year, setYear] = useState(data.profile.year);
  const [bio, setBio] = useState(data.profile.bio);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const initials = (name || data.profile.name)
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setError('');
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      university: university.trim(),
      major: major.trim(),
      year: year.trim(),
      bio: bio.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="max-w-[780px] mx-auto space-y-6">
      {/* Header Summary Card */}
      <section className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-[#2A2C30] bg-[#222429] flex items-center justify-center shrink-0">
            {data.profile.avatarUrl && !imgFailed ? (
              <img
                src={data.profile.avatarUrl}
                alt={data.profile.name}
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[18px] font-semibold text-[#F2F2F2]">
                {initials || 'CP'}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#F2F2F2]">
              {data.profile.name}
            </h2>
            <p className="text-[13px] text-[#92959D]">
              {data.profile.major}
              {data.profile.year ? ` · ${data.profile.year}` : ''}
            </p>
            <p className="text-[12px] text-[#92959D]/80 mt-0.5">
              {data.profile.university}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-[12px] tabular-nums border-t sm:border-t-0 pt-3 sm:pt-0 border-[#2A2C30]">
          <div>
            <div className="text-[#92959D]">Subjects</div>
            <div className="text-[16px] font-semibold text-[#F2F2F2]">
              {data.subjects.length}
            </div>
          </div>
          <div>
            <div className="text-[#92959D]">Notes</div>
            <div className="text-[16px] font-semibold text-[#F2F2F2]">
              {data.notes.length}
            </div>
          </div>
          <div>
            <div className="text-[#92959D]">Quizzes</div>
            <div className="text-[16px] font-semibold text-[#F2F2F2]">
              {data.quizAttempts.length}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Form */}
      <section className="bg-[#1B1D20] border border-[#2A2C30] rounded-lg p-5 sm:p-6">
        <div className="pb-4 border-b border-[#2A2C30]">
          <h3 className="text-[15px] font-semibold text-[#F2F2F2]">
            Academic Profile
          </h3>
          <p className="text-[13px] text-[#92959D] mt-0.5">
            Personalize your dashboard greeting and academic details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded bg-[#D06A6A]/10 border border-[#D06A6A]/40 text-[12px] text-[#D06A6A]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Academic Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                University / Institution
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
                Standing / Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. Junior"
                className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
              Major / Field of Study
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#92959D] mb-1.5">
              Focus Statement / Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-md bg-[#101113] border border-[#2A2C30] text-[13px] text-[#F2F2F2] focus:outline-none focus:border-[#91A5D5] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-[12px] text-[#5FA876]">
              {saved ? 'Profile updated.' : ''}
            </span>
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-[#91A5D5] hover:bg-[#A3B5E0] text-[#101113] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
