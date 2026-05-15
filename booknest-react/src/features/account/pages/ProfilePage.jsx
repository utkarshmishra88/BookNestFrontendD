import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiCalendar, FiShield, FiMapPin, FiEdit2, FiSave, FiPhone,
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import addressService from '@/services/addressService';
import authService from '@/services/authService';
import { extractUserFromJWT } from '@/lib/jwtUtils';
import Spinner from '@/components/ui/Spinner';
import { statesData, districtsData } from '@/lib/indiaData';

const ProfilePage = () => {
  const { user, token, updateUser, setAuth } = useAuthStore();
  const qc = useQueryClient();
  const [newAddress, setNewAddress] = React.useState({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    mobileNumber: '',
    isDefault: false,
  });
  const [editingId, setEditingId] = React.useState(null);
  const [drafts, setDrafts] = React.useState({});

  const [editingProfile, setEditingProfile] = React.useState(false);
  const [draftName, setDraftName] = React.useState('');
  const [draftEmail, setDraftEmail] = React.useState('');
  const [draftMobileNumber, setDraftMobileNumber] = React.useState('');
  const [emailOtpSent, setEmailOtpSent] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState('');
  const [emailOtp, setEmailOtp] = React.useState('');
  const [savingProfile, setSavingProfile] = React.useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery(
    ['profile', user?.userId],
    () => authService.getProfile(user.userId),
    { enabled: !!user?.userId }
  );

  React.useEffect(() => {
    if (profile) {
      setDraftName(profile.fullName || '');
      setDraftEmail(profile.email || '');
      setDraftMobileNumber(profile.mobileNumber || '');
    } else if (user) {
      setDraftName(user.fullName || '');
      setDraftEmail(user.email || '');
      setDraftMobileNumber(user.mobileNumber || '');
    }
  }, [profile, user]);

  const { data: addresses = [], isLoading: addressesLoading } = useQuery(
    ['addresses', user?.userId],
    () => addressService.getUserAddresses(user.userId),
    {
      enabled: !!user?.userId,
      retry: false,
      onError: () => toast.error('Could not load addresses.'),
    }
  );

  const addAddressMutation = useMutation(addressService.createAddress, {
    onSuccess: () => {
      qc.invalidateQueries(['addresses', user?.userId]);
      setNewAddress({
        label: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        mobileNumber: '',
        isDefault: false,
      });
      toast.success('Address added.');
    },
    onError: (err) => toast.error(err.message || 'Failed to add address.'),
  });

  const updateAddressMutation = useMutation(
    ({ addressId, data }) => addressService.updateAddress(addressId, data),
    {
      onSuccess: () => {
        qc.invalidateQueries(['addresses', user?.userId]);
        setEditingId(null);
        toast.success('Address updated.');
      },
      onError: (err) => toast.error(err.message || 'Failed to update address.'),
    }
  );

  const onSaveProfile = async () => {
    if (!draftName?.trim()) {
      toast.error('Name is required.');
      return;
    }
    setSavingProfile(true);
    try {
      await authService.updateProfile(user.userId, { 
        fullName: draftName.trim(),
        mobileNumber: draftMobileNumber.trim()
      });
      updateUser({ fullName: draftName.trim(), mobileNumber: draftMobileNumber.trim() });
      qc.invalidateQueries(['profile', user.userId]);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const onSendEmailOtp = async () => {
    const next = draftEmail.trim();
    if (!next) {
      toast.error('Enter a new email address.');
      return;
    }
    const current = (profile?.email || user?.email || '').toLowerCase();
    if (next.toLowerCase() === current) {
      toast.error('Choose a different email than your current one.');
      return;
    }
    setSavingProfile(true);
    try {
      await authService.requestEmailChange(user.userId, next);
      setPendingEmail(next);
      setEmailOtpSent(true);
      setEmailOtp('');
      toast.success('We sent a verification code to your new email.');
    } catch (err) {
      toast.error(err.message || 'Could not send verification code.');
    } finally {
      setSavingProfile(false);
    }
  };

  const onConfirmEmailOtp = async () => {
    if (!emailOtp.trim()) {
      toast.error('Enter the code from your email.');
      return;
    }
    setSavingProfile(true);
    try {
      const newToken = await authService.confirmEmailChange(user.userId, {
        newEmail: pendingEmail,
        otp: emailOtp.trim(),
      });
      const u = extractUserFromJWT(newToken);
      if (!u) throw new Error('Invalid token after email change');
      setAuth({
        token: newToken,
        user: {
          ...u,
          email: pendingEmail,
          fullName: u.fullName || draftName,
        },
      });
      qc.invalidateQueries(['profile']);
      setEmailOtpSent(false);
      setPendingEmail('');
      setEmailOtp('');
      setEditingProfile(false);
      toast.success('Email verified and updated.');
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  const onAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.postalCode
        || !newAddress.country || !newAddress.mobileNumber?.trim()) {
      toast.error('Please fill all required fields including mobile number.');
      return;
    }
    addAddressMutation.mutate({ userId: user.userId, ...newAddress });
  };

  const onEditAddress = (addr) => {
    setEditingId(addr.addressId);
    setDrafts((prev) => ({
      ...prev,
      [addr.addressId]: {
        label: addr.label || '',
        line1: addr.line1 || '',
        line2: addr.line2 || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postalCode || '',
        country: addr.country || 'India',
        mobileNumber: addr.mobileNumber || '',
        isDefault: !!addr.isDefault,
      },
    }));
  };

  const onSaveAddress = (addressId) => {
    const payload = drafts[addressId];
    if (!payload?.line1 || !payload?.city || !payload?.state || !payload?.postalCode
        || !payload?.country || !payload?.mobileNumber?.trim()) {
      toast.error('Please fill all required fields including mobile number.');
      return;
    }
    updateAddressMutation.mutate({ addressId, data: { userId: user.userId, ...payload } });
  };

  const setDraftField = (addressId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [addressId]: { ...prev[addressId], [field]: value },
    }));
  };

  const displayName = profile?.fullName ?? user?.fullName;
  const displayEmail = profile?.email ?? user?.email;
  const memberSince = profile?.createdAt ?? user?.createdAt;

  if (profileLoading && !user) {
    return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  }

  return (
    <div className="page-container max-w-6xl">
      <h1 className="section-title mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Profile Details Section */}
        <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-parchment-200 dark:border-ink-700">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-sky-600 flex items-center justify-center text-3xl text-white font-display">
                {displayName?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 className="font-display text-xl text-ink-900 dark:text-white">{displayName}</h2>
                <p className="font-sans text-sm text-ink-500 dark:text-ink-400">{displayEmail}</p>
                <span className={`mt-1 inline-block ${user?.role === 'ADMIN' ? 'badge-red' : 'badge-sky'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            {!editingProfile && (
              <button type="button" className="btn-secondary shrink-0" onClick={() => setEditingProfile(true)}>
                <FiEdit2 className="w-4 h-4" /> Edit
              </button>
            )}
          </div>

          {editingProfile ? (
            <div className="space-y-6">
              <div>
                <label className="font-sans text-xs text-ink-500 dark:text-ink-400 uppercase">Full name</label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <input
                    className="input-field flex-1"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-sans text-xs text-ink-500 dark:text-ink-400 uppercase">Mobile Number (WhatsApp)</label>
                <div className="flex flex-col sm:flex-row gap-3 mt-1">
                  <input
                    className="input-field flex-1"
                    value={draftMobileNumber}
                    onChange={(e) => setDraftMobileNumber(e.target.value)}
                    placeholder="+919876543210"
                  />
                  <button type="button" className="btn-primary w-full sm:w-auto" disabled={savingProfile} onClick={onSaveProfile}>
                    {savingProfile ? '…' : <><FiSave className="w-4 h-4" /> Save Profile</>}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-sans text-xs text-ink-500 dark:text-ink-400 uppercase">Email</label>
                <input
                  type="email"
                  className="input-field mt-1"
                  value={draftEmail}
                  onChange={(e) => {
                    setDraftEmail(e.target.value);
                    setEmailOtpSent(false);
                    setEmailOtp('');
                  }}
                />
                <p className="font-body text-xs text-ink-500 dark:text-ink-400 mt-1">
                  To change your email, click Send OTP — we will email a code to the new address.
                </p>
                <button
                  type="button"
                  className="btn-secondary mt-3"
                  disabled={savingProfile}
                  onClick={onSendEmailOtp}
                >
                  Send OTP
                </button>
              </div>

              {emailOtpSent && (
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-ink-800 border border-sky-200 dark:border-ink-700 space-y-3">
                  <p className="font-sans text-sm text-ink-700 dark:text-ink-300">
                    Enter the code sent to <strong>{pendingEmail}</strong>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                    <div className="flex-1 min-w-0">
                      <label className="font-sans text-xs text-ink-500 dark:text-ink-400 uppercase">Verification code</label>
                      <input
                        className="input-field mt-1"
                        placeholder="6-digit OTP"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-primary w-full sm:w-auto mt-2 sm:mt-0"
                      disabled={savingProfile}
                      onClick={onConfirmEmailOtp}
                    >
                      {savingProfile ? 'Verifying…' : 'Verify OTP'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingProfile(false);
                    setEmailOtpSent(false);
                    setEmailOtp('');
                    setPendingEmail('');
                    setDraftName(displayName || '');
                    setDraftEmail(displayEmail || '');
                    setDraftMobileNumber(profile?.mobileNumber || user?.mobileNumber || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { icon: FiUser, label: 'Full Name', value: displayName },
                { icon: FiMail, label: 'Email', value: displayEmail },
                { icon: FiPhone, label: 'WhatsApp', value: profile?.mobileNumber || user?.mobileNumber },
                { icon: FiShield, label: 'Role', value: user?.role },
                {
                  icon: FiCalendar,
                  label: 'Member Since',
                  value: memberSince ? format(new Date(memberSince), 'MMMM yyyy') : 'N/A',
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 p-3 rounded-lg bg-parchment-50 dark:bg-ink-900">
                  <div className="w-8 h-8 rounded-lg bg-parchment-100 dark:bg-ink-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-ink-500 dark:text-ink-400" />
                  </div>
                  <div>
                    <p className="font-sans text-xs text-ink-400 uppercase tracking-wide">{label}</p>
                    <p className="font-sans text-sm text-ink-800 dark:text-parchment-50 font-medium">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Addresses Section */}
        <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-5">
            <FiMapPin className="w-5 h-5 text-sky-600" />
            <h2 className="font-display text-xl text-ink-900 dark:text-white">My Addresses</h2>
          </div>

          <form onSubmit={onAddAddress} className="space-y-3 mb-6 pb-6 border-b border-parchment-200 dark:border-ink-700">
            <p className="font-sans text-sm font-medium text-ink-700 dark:text-ink-300">Add New Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input-field" placeholder="Label (Home/Office)" value={newAddress.label} onChange={(e) => setNewAddress((s) => ({ ...s, label: e.target.value }))} />
              <input className="input-field" placeholder="Mobile * (delivery)" value={newAddress.mobileNumber} onChange={(e) => setNewAddress((s) => ({ ...s, mobileNumber: e.target.value }))} />
              <input className="input-field sm:col-span-2" placeholder="Address Line 1 *" value={newAddress.line1} onChange={(e) => setNewAddress((s) => ({ ...s, line1: e.target.value }))} />
              <input className="input-field sm:col-span-2" placeholder="Address Line 2" value={newAddress.line2} onChange={(e) => setNewAddress((s) => ({ ...s, line2: e.target.value }))} />
              <select 
                className="input-field" 
                value={newAddress.state} 
                onChange={(e) => {
                  const state = e.target.value;
                  setNewAddress((s) => ({ ...s, state, city: '' }));
                }}
              >
                <option value="">Select State *</option>
                {statesData.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select 
                className="input-field" 
                value={newAddress.city} 
                onChange={(e) => setNewAddress((s) => ({ ...s, city: e.target.value }))}
                disabled={!newAddress.state}
              >
                <option value="">Select District *</option>
                {newAddress.state && districtsData[newAddress.state]?.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <input className="input-field" placeholder="Postal Code *" value={newAddress.postalCode} onChange={(e) => setNewAddress((s) => ({ ...s, postalCode: e.target.value }))} />
              <input className="input-field bg-parchment-100 dark:bg-ink-800 cursor-not-allowed" value="India" readOnly />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <label className="inline-flex items-center gap-2 font-sans text-sm text-ink-700 dark:text-ink-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-parchment-300 text-sky-600 focus:ring-sky-500"
                  checked={newAddress.isDefault} 
                  onChange={(e) => setNewAddress((s) => ({ ...s, isDefault: e.target.checked }))} 
                />
                Set as default
              </label>
              <button type="submit" disabled={addAddressMutation.isLoading} className="btn-primary w-full sm:w-auto">
                {addAddressMutation.isLoading ? 'Adding...' : 'Add Address'}
              </button>
            </div>
          </form>

          {addressesLoading ? (
            <p className="font-sans text-sm text-ink-500 dark:text-ink-400">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <p className="font-sans text-sm text-ink-500 dark:text-ink-400">No addresses added yet.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const editing = editingId === addr.addressId;
                const draft = drafts[addr.addressId] || {};
                return (
                  <div key={addr.addressId} className="rounded-xl border border-parchment-200 dark:border-ink-700 p-4 bg-parchment-50 dark:bg-ink-900/60">
                    {editing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input className="input-field" value={draft.label || ''} onChange={(e) => setDraftField(addr.addressId, 'label', e.target.value)} placeholder="Label" />
                          <input className="input-field" value={draft.mobileNumber || ''} onChange={(e) => setDraftField(addr.addressId, 'mobileNumber', e.target.value)} placeholder="Mobile *" />
                          <input className="input-field sm:col-span-2" value={draft.line1 || ''} onChange={(e) => setDraftField(addr.addressId, 'line1', e.target.value)} placeholder="Address Line 1 *" />
                          <input className="input-field sm:col-span-2" value={draft.line2 || ''} onChange={(e) => setDraftField(addr.addressId, 'line2', e.target.value)} placeholder="Address Line 2" />
                          <select 
                            className="input-field" 
                            value={draft.state || ''} 
                            onChange={(e) => {
                              const state = e.target.value;
                              setDrafts((prev) => ({
                                ...prev,
                                [addr.addressId]: { ...prev[addr.addressId], state, city: '' },
                              }));
                            }}
                          >
                            <option value="">Select State *</option>
                            {statesData.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>

                          <select 
                            className="input-field" 
                            value={draft.city || ''} 
                            onChange={(e) => setDraftField(addr.addressId, 'city', e.target.value)}
                            disabled={!draft.state}
                          >
                            <option value="">Select District *</option>
                            {draft.state && districtsData[draft.state]?.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>

                          <input className="input-field" value={draft.postalCode || ''} onChange={(e) => setDraftField(addr.addressId, 'postalCode', e.target.value)} placeholder="Postal Code *" />
                          <input className="input-field bg-parchment-100 dark:bg-ink-800 cursor-not-allowed sm:col-span-2" value="India" readOnly />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                          <label className="inline-flex items-center gap-2 font-sans text-sm text-ink-700 dark:text-ink-300 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-parchment-300 text-sky-600 focus:ring-sky-500"
                              checked={!!draft.isDefault} 
                              onChange={(e) => setDraftField(addr.addressId, 'isDefault', e.target.checked)} 
                            />
                            Default address
                          </label>
                          <div className="flex gap-2">
                            <button type="button" className="btn-primary" onClick={() => onSaveAddress(addr.addressId)}>
                              <FiSave className="w-4 h-4" /> Save
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-sans text-sm font-semibold text-ink-900 dark:text-white flex items-center gap-2 flex-wrap">
                            {addr.label || 'Address'} {addr.isDefault ? <span className="badge-sky">Default</span> : null}
                          </p>
                          {addr.mobileNumber ? (
                            <p className="font-sans text-xs text-ink-600 dark:text-ink-400 mt-1 flex items-center gap-1">
                              <FiPhone className="w-3.5 h-3.5" /> {addr.mobileNumber}
                            </p>
                          ) : null}
                          <p className="font-sans text-sm text-ink-700 dark:text-ink-300 mt-1">
                            {[addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <button type="button" className="btn-secondary shrink-0" onClick={() => onEditAddress(addr)}>
                          <FiEdit2 className="w-4 h-4" /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
