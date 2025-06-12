'use client'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  Stack,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { User, CreateUserDto, UpdateUserDto } from '../types/api'
import AppLayout from '../components/layout/AppLayout'
import AuthGuard from '../components/guards/AuthGuard'

interface Role {
  id: string
  name: string
}

export default function UsuariosPage() {
  const { user: loggedInUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, rolesData] = await Promise.all([
        api.getUsers(),
        api.getRoles()
      ]);
      setUsers(usersData)
      setRoles(rolesData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados da página')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !roleId) {
      setError('Todos os campos são obrigatórios')
      return
    }

    if (!loggedInUser?.tenantId) {
      setError('Não foi possível identificar a empresa (tenantId) do usuário logado.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const userData = { 
        name, 
        email, 
        password, 
        roleId,
        tenantId: loggedInUser.tenantId 
      }

      await api.createUser(userData as CreateUserDto)
      setSuccess('Usuário criado com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Erro ao criar usuário:', err)
      setError('Erro ao criar usuário. Verifique se o e-mail já existe.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !name.trim() || !email.trim() || !roleId) {
      setError('Nome, e-mail e perfil são obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const updateData: UpdateUserDto = {
        name,
        email,
        roleId,
        password: password.trim() ? password.trim() : undefined,
      }

      await api.updateUser(editingUser.id, updateData)
      setSuccess('Usuário atualizado com sucesso!')
      setDialogOpen(false)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err)
      setError('Erro ao atualizar usuário')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) return

    try {
      await api.deleteUser(userId)
      setSuccess('Usuário excluído com sucesso!')
      loadData()
    } catch (err) {
      console.error('Erro ao excluir usuário:', err)
      setError('Erro ao excluir usuário')
    }
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
    setRoleId(user.roleId)
    setPassword('')
    setDialogOpen(true)
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRoleId('')
    setEditingUser(null)
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }
  
  const getRoleName = (id: string): string => {
    return roles.find(r => r.id === id)?.name || 'N/A'
  }

  const getRoleColor = (roleName: string) => {
    switch(roleName?.toLowerCase()) {
      case 'admin': return 'error'
      case 'user': return 'primary'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AuthGuard requiredRoles={['admin']}>
      <AppLayout>
        <Box sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h6">
              Lista de Usuários ({users.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Novo Usuário
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearMessages}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={clearMessages}>
              {success}
            </Alert>
          )}

          <Card>
            <CardContent>
              {users.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Nenhum usuário cadastrado
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Perfil</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => {
                        const roleName = getRoleName(user.roleId)
                        return (
                          <TableRow key={user.id} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                                  {user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2" fontWeight="medium">
                                  {user.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={roleName}
                                color={getRoleColor(roleName)}
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Editar usuário">
                                <IconButton size="small" onClick={() => openEditDialog(user)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir usuário">
                                <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id, user.name)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  autoFocus
                  label="Nome Completo"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
                <TextField
                  label="Senha"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  helperText={editingUser ? 'Deixe em branco para não alterar' : ''}
                  required={!editingUser}
                />
                <FormControl fullWidth required>
                  <InputLabel>Perfil</InputLabel>
                  <Select
                    value={roleId}
                    label="Perfil"
                    onChange={(e) => setRoleId(e.target.value)}
                    disabled={submitting}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AppLayout>
    </AuthGuard>
  )
}