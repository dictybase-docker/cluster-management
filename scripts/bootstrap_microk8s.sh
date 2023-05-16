if ! [ -f `which microk8s` ];
then
    sudo snap install microk8s --classic --channel=1.26/stable
fi
sudo usermod -a -G microk8s $USER
sudo microk8s status --wait-ready
sudo microk8s enable dns
sudo microk8s.config > kubeconfig
