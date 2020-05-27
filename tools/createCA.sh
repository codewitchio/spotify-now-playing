#!/bin/bash
#timh|2020|MIT license

# Override by running with ENV vars set.
rootdomain="${ROOT_DOMAIN:-domain}"
clientdomain="${CLIENT_DOMAIN:-localhost}"
rootca_key="${ROOT_CA_KEY:-rootca.key}"
rootca_cert="${ROOT_CA_CERT:-rootca.crt}"
client_key="${CLIENT_KEY:-$clientdomain.key}"
client_cert="${CLIENT_KEY:-$clientdomain.crt}"
client_csr="${CLIENT_CSR:-$clientdomain.csr}"
keysize="${KEYSIZE:-4096}"
expire="${EXPIRE:-365}"
sha_bits="${SHA_BITS:-256}"

# Root CA key
createRootCA(){
	openssl genrsa -out "$rootca_key" "$keysize"
}

# Create the Root CA Certificate.
createRootCACert(){
	openssl req -x509 -new -nodes -key "$rootca_key" -subj "/C=SE/ST=Stockholm/O=Dev/CN=$rootdomain" \
		-addext "subjectAltName = IP:127.0.0.1" \
		-sha"$sha_bits" -days "$expire" -out "$rootca_cert" 
}

# Create a key for the client.
createClientKey(){
	openssl genrsa -out "$client_key" 
}

# Create a CSR (Certificate Signing Request)
createClientCSR(){
	openssl req -new -sha256 -key "$client_key" -subj "/C=SE/ST=Stockholm/O=Dev/CN=$clientdomain" -out "$client_csr"
}

# Log out CSR to stdout
verifyClientCSR(){
	openssl req -in "$client_csr" -noout -text
}

# Accept your own CSR with your rootca key.
acceptCSR(){
	openssl x509 -req -in "$client_csr" \
		-CA "$rootca_cert" -CAkey "$rootca_key" \
		-CAcreateserial -out "$client_cert" \
		-days "$expire" -sha"$sha_bits"
}

# Log certificate to stdout
verifyCert(){
	openssl x509 -in "$client_cert" -text -noout
}

# Install into certs folder
installRootCA(){
	printf "installing certs\n"
	mkdir -p ../src/certs/
	mv "$client_key" ../src/certs/
	mv "$client_cert" ../src/certs/
	# Give r-w execution to group's u:o so we can use it for dev! 
	chmod 755 -R ../src/certs/
}

# Print help for CLI
printHelp() {
	printf "\nbuild -b [yes|no]\nclean -c [yes|no]\n" 
}

# Clean up artifacts.
cleanup(){
	rm -rf ./*.key ./*.crt ./*.csr ./*.srl
	rm -rf ../src/certs/*.key ../src/certs/*.crt
}

# Check if we are running as root
if [ "$EUID" -ne 0 ]; then
	printf "Please run this script as root in order to install the development certificate\n"
	exit 1
fi

# Parse flags
while getopts :h:b:c: flag
do
	case "${flag}" in
		h) helper=${OPTARG};;
		b) build=${OPTARG};;
		c) clean=${OPTARG};;
		*) printHelp && exit 1;;
	esac
done

# Act on flags
if [ "$helper" != "" ] || [ "$build" == "" ] && [ "$clean" == "" ]; then
	printHelp
	exit 0
elif [ "$build" == "yes" ]; then
	createRootCA
	createRootCACert
	createClientKey
	createClientCSR
	acceptCSR
	verifyCert
	installRootCA
elif [ "$clean" == "yes" ]; then
	printf "cleaning...\n"
	cleanup
fi

printf "exiting...\n"
exit 0
