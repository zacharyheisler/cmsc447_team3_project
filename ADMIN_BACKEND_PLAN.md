# Admin/Auth Backend Plan

## Scope
- Auth module
- JWT login
- RBAC guard/decorator
- Admin module
- Admin user management endpoints
- Minimal schema changes for auth/admin

## Avoid touching
- Ticket CRUD internals
- Agent workflow internals
- User self-service backend

## Planned schema additions
- User.role
- User.isActive
- User.isVerified (if needed)
- password hashing field cleanup if needed

## Planned endpoints
- POST /auth/login
- GET /admin/users
- GET /admin/users/:id
- POST /admin/users
- PATCH /admin/users/:id
- PATCH /admin/users/:id/role
- PATCH /admin/users/:id/status