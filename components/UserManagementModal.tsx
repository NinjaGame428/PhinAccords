'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Shield, 
  Ban, 
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface UserData {
  id?: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  is_banned: boolean;
  ban_reason?: string;
  ban_expires_at?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserData | null;
  onSave: (userData: UserData) => Promise<void>;
  onDelete?: (userId: string) => Promise<void>;
  onBan?: (userId: string, banReason: string, banExpiresAt?: string) => Promise<void>;
  onUnban?: (userId: string) => Promise<void>;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  onDelete,
  onBan,
  onUnban
}) => {
  const [formData, setFormData] = useState<UserData>({
    email: '',
    full_name: '',
    role: 'user',
    status: 'active',
    is_banned: false,
    ban_reason: '',
    ban_expires_at: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banExpiresAt, setBanExpiresAt] = useState('');
  const [showBanForm, setShowBanForm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        is_banned: user.is_banned,
        ban_reason: user.ban_reason || '',
        ban_expires_at: user.ban_expires_at || ''
      });
      setBanReason(user.ban_reason || '');
      setBanExpiresAt(user.ban_expires_at || '');
    } else {
      setFormData({
        email: '',
        full_name: '',
        role: 'user',
        status: 'active',
        is_banned: false,
        ban_reason: '',
        ban_expires_at: ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (user?.id && onDelete) {
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        setIsLoading(true);
        try {
          await onDelete(user.id);
          onClose();
        } catch (error) {
          console.error('Error deleting user:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleBan = async () => {
    if (user?.id && onBan) {
      setIsLoading(true);
      try {
        await onBan(user.id, banReason, banExpiresAt || undefined);
        setShowBanForm(false);
        onClose();
      } catch (error) {
        console.error('Error banning user:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUnban = async () => {
    if (user?.id && onUnban) {
      setIsLoading(true);
      try {
        await onUnban(user.id);
        onClose();
      } catch (error) {
        console.error('Error unbanning user:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <h2 className="text-xl font-semibold">
              {user ? 'Edit User' : 'Create New User'}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Status */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>User Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Badge variant={formData.is_banned ? 'destructive' : 'default'}>
                    {formData.is_banned ? 'Banned' : 'Active'}
                  </Badge>
                  <Badge variant={formData.role === 'admin' ? 'destructive' : 'secondary'}>
                    {formData.role}
                  </Badge>
                  <Badge variant="outline">
                    {formData.status}
                  </Badge>
                </div>
                {formData.is_banned && formData.ban_reason && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      <strong>Ban Reason:</strong> {formData.ban_reason}
                    </p>
                    {formData.ban_expires_at && (
                      <p className="text-sm text-red-600">
                        <strong>Expires:</strong> {new Date(formData.ban_expires_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* User Information Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ban/Unban Section */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ban className="h-5 w-5" />
                  <span>User Ban Management</span>
                </CardTitle>
                <CardDescription>
                  Ban or unban this user from accessing the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!formData.is_banned ? (
                  <div className="space-y-4">
                    <Button
                      variant="destructive"
                      onClick={() => setShowBanForm(true)}
                      className="w-full"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                    {showBanForm && (
                      <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="space-y-2">
                          <Label htmlFor="ban_reason">Ban Reason</Label>
                          <Textarea
                            id="ban_reason"
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Enter reason for banning this user..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ban_expires">Ban Expires (Optional)</Label>
                          <Input
                            id="ban_expires"
                            type="datetime-local"
                            value={banExpiresAt}
                            onChange={(e) => setBanExpiresAt(e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground">
                            Leave empty for permanent ban
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleBan} variant="destructive" disabled={!banReason || isLoading}>
                            <Ban className="h-4 w-4 mr-2" />
                            Confirm Ban
                          </Button>
                          <Button onClick={() => setShowBanForm(false)} variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">User is currently banned</span>
                      </div>
                      <p className="text-sm text-red-700">
                        <strong>Reason:</strong> {formData.ban_reason}
                      </p>
                      {formData.ban_expires_at && (
                        <p className="text-sm text-red-600">
                          <strong>Expires:</strong> {new Date(formData.ban_expires_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleUnban}
                      variant="outline"
                      className="w-full"
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unban User
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {user && onDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Delete User
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save User'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
