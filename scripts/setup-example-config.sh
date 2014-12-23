umask u=rw,go=
mkdir -p /etc/squerier
#TODO: change this to make it safe
# cp -ri sampleconfig/* /etc/squerier
cp -rf sampleconfig/* /etc/squerier
chmod u=rwxs,go=rx /etc/squerier
#TODO: having go=r may expose db credentials
chmod u=rw,go=r /etc/squerier/squerier.conf
chmod u=rwx,go=rx /etc/squerier/queries
chmod u=rw,go=r /etc/squerier/queries/*
