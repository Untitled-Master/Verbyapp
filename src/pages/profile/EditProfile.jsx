import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, update } from 'firebase/database';
import { Toaster, toast } from 'sonner';
import { database } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import MainNavbar from '../../components/MainNavbar';
import { ArrowLeft, Camera, Save } from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateCachedUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: '',
    country: '',
    languages: '',
    photoURL: user?.photoURL || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const languagesArray = formData.languages
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const photoURLValue = formData.photoURL.trim() || null;

      await update(ref(database, `users/${user.uid}/profile`), {
        displayName: formData.displayName,
        bio: formData.bio || null,
        country: formData.country || null,
        languages: languagesArray,
        photoURL: photoURLValue,
        updatedAt: Date.now(),
      });

      updateCachedUser({
        displayName: formData.displayName,
        photoURL: photoURLValue,
      });

      toast.success('Profile updated successfully!');
      
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-[#1a1a1a] font-sans">
      <Toaster position="top-center" richColors />
      <MainNavbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </button>

        <div className="bg-white rounded-2xl border border-[#DEDDDA] p-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-6">Edit Profile</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#DEDDDA]">
                  <img 
                    src={formData.photoURL || "https://i.pinimg.com/736x/ec/49/f5/ec49f523af568d4fb71c1d771f07cb8c.jpg"} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#EB3514] rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Click to change photo</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Photo URL
              </label>
              <input
                type="url"
                name="photoURL"
                value={formData.photoURL}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-3 rounded-lg border border-[#DEDDDA] bg-[#F0EFEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#EB3514]/20 focus:border-[#EB3514] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#DEDDDA] bg-[#F0EFEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#EB3514]/20 focus:border-[#EB3514] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 rounded-lg border border-[#DEDDDA] bg-[#F0EFEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#EB3514]/20 focus:border-[#EB3514] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Country Code
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. dz, fr, us"
                  className="w-full px-4 py-3 rounded-lg border border-[#DEDDDA] bg-[#F0EFEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#EB3514]/20 focus:border-[#EB3514] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Languages
                </label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="French, Arabic, English"
                  className="w-full px-4 py-3 rounded-lg border border-[#DEDDDA] bg-[#F0EFEB] text-sm focus:outline-none focus:ring-2 focus:ring-[#EB3514]/20 focus:border-[#EB3514] transition-colors"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#1a1a1a] text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
