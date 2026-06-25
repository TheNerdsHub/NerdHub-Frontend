import { useAuth } from '@/lib/auth-context'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  useDocumentTitle('Profile')
  const { isAuthenticated, user, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold">Sign in required</h2>
        <p className="mt-2 text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <img 
            src={user?.avatar || 'https://www.gravatar.com/avatar/?d=identicon'} 
            alt="Avatar" 
            className="h-16 w-16 rounded-full bg-muted"
          />
          <div>
            <CardTitle className="text-2xl">{user?.username}</CardTitle>
            <CardDescription>{user?.email || 'No email provided'}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 border-t">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">First Name</div>
              <div>{user?.firstName || '—'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Name</div>
              <div>{user?.lastName || '—'}</div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button variant="destructive" onClick={logout}>Sign Out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
