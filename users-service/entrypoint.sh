echo "Migrating"
npx prisma migrate dev --name init
echo "Applying migrations"
npx prisma migrate deploy
echo "starting the service"
exec "$@"