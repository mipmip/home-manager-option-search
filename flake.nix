{
  description = "Home Manager option search static website generator";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, ... }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [ "x86_64-linux" ];
      pkgsForSystem = system: (import nixpkgs { inherit system; });
    in
    {
      packages = forAllSystems (system:
        let
          pkgs = (pkgsForSystem system);
        in
        {
          default = pkgs.runCommand "public" {} ''
            cd ${./.}
            ${pkgs.hugo}/bin/hugo --noBuildLock -d $out
          '';
        });

      devShells = forAllSystems (system: {
        default = (pkgsForSystem system).mkShell {
          buildInputs = with (pkgsForSystem system); [
            hugo
            ruby
          ];
        };
      });
    };
}
