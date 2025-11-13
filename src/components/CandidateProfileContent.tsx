// src/components/CandidateProfileContent.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
  Modal,
  Pressable,
} from "react-native";
import { getCandidateById, castVote } from "../lib/api";
import { isWeb } from "../lib/platform";

type Props = {
  candidateId: string;
  nim?: string;
  onVoted?: () => void;
  isElectionOpen?: boolean;
  onClose?: () => void; // for web modal back
};

export default function CandidateProfileContent({
  candidateId,
  nim,
  onVoted,
  isElectionOpen = true,
  onClose,
}: Props) {
  const [candidate, setCandidate] = useState<any | null>(null);
  const [tab, setTab] = useState<"profile" | "kampanye">("profile");
  const [loading, setLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [voting, setVoting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const showUserAlert = (title: string, message: string) => {
    if (isWeb) {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getCandidateById(candidateId);
        if (active) setCandidate(data);
      } catch {
        showUserAlert("Error", "Gagal memuat profil kandidat.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [candidateId]);

  const handleVoteNow = async () => {
    if (!nim) {
      showUserAlert("NIM tidak tersedia", "Masukkan NIM sebelum memilih.");
      return;
    }

    try {
      setVoting(true);
      await castVote(nim.trim(), candidateId);
      setVoting(false);
      setConfirmVisible(false);

      onVoted?.();
    } catch (err: any) {
      setVoting(false);
      const msg = err?.message ?? "Terjadi kesalahan.";
      showUserAlert("Gagal memilih", msg);
      setConfirmVisible(false);
    }
  };

  const openLinkSafe = (url?: string) => {
    if (!url) return;

    if (isWeb) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    Linking.openURL(url).catch(() =>
      showUserAlert("Tautan tidak valid", "Tautan tidak dapat dibuka.")
    );
  };

  if (loading)
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading...</Text>
      </View>
    );

  if (!candidate)
    return (
      <View style={{ padding: 20 }}>
        <Text>Profil tidak ditemukan.</Text>
      </View>
    );

  return (
    <>
      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.content}
        nestedScrollEnabled={true} // IMPORTANT for phone scrolling
      >
        {/* Web back button */}
        {isWeb && onClose && (
          <TouchableOpacity
            style={{ marginBottom: 12 }}
            onPress={onClose}
          >
            <Text style={{ color: "#6B7280" }}>← Kembali</Text>
          </TouchableOpacity>
        )}

        <Image
          source={
            !imageError && candidate.photo_url
              ? { uri: candidate.photo_url }
              : require("../../assets/logo1.png")
          }
          style={styles.headerImage}
          onError={() => setImageError(true)}
        />

        <Text style={styles.title}>
          {candidate.name_president} & {candidate.name_vice}
        </Text>
        <Text style={styles.subtitle}>{candidate.faculty ?? ""}</Text>

        {/* Vote button */}
        <TouchableOpacity
          style={[styles.voteNow, !isElectionOpen && styles.voteNowDisabled]}
          onPress={() => isElectionOpen && setConfirmVisible(true)}
          activeOpacity={isElectionOpen ? 0.8 : 1}
        >
          <Text
            style={[
              styles.voteNowText,
              !isElectionOpen && styles.voteNowTextDisabled,
            ]}
          >
            {isElectionOpen ? "Vote Sekarang" : "Pemilihan Ditutup"}
          </Text>
        </TouchableOpacity>

        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === "profile" && styles.tabActive]}
            onPress={() => setTab("profile")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "profile" && styles.tabTextActive,
              ]}
            >
              Profil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === "kampanye" && styles.tabActive]}
            onPress={() => setTab("kampanye")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "kampanye" && styles.tabTextActive,
              ]}
            >
              Kampanye
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB CONTENT */}
        {tab === "profile" ? (
          <>
            <Text style={styles.sectionHeader}>{candidate.name_president}</Text>
            <Text style={styles.muted}>Tempat, Tanggal Lahir</Text>
            <Text style={styles.body}>
              {candidate.president_birthplace ?? "-"}
              {candidate.president_birthdate
                ? `, ${candidate.president_birthdate}`
                : ""}
            </Text>

            <Text style={styles.sectionHeader}>Biografi</Text>
            <Text style={styles.body}>
              {candidate.president_bio ?? candidate.vision ?? "-"}
            </Text>

            <View style={{ height: 12 }} />

            <Text style={styles.sectionHeader}>{candidate.name_vice}</Text>
            <Text style={styles.muted}>Tempat, Tanggal Lahir</Text>
            <Text style={styles.body}>
              {candidate.vice_birthplace ?? "-"}
              {candidate.vice_birthdate
                ? `, ${candidate.vice_birthdate}`
                : ""}
            </Text>

            <Text style={styles.sectionHeader}>Biografi</Text>
            <Text style={styles.body}>
              {candidate.vice_bio ?? candidate.mission ?? "-"}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionHeader}>Visi</Text>
            <Text style={styles.body}>{candidate.vision ?? "-"}</Text>

            <Text style={[styles.sectionHeader, { marginTop: 12 }]}>
              Misi
            </Text>
            <Text style={styles.body}>{candidate.mission ?? "-"}</Text>
          </>
        )}

        {/* Social Links */}
        {candidate.social_links && (
          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionHeader}>Sosial</Text>
            {Object.entries(candidate.social_links).map(([k, v]) => (
              <TouchableOpacity key={k} onPress={() => openLinkSafe(v as string)}>
                <Text style={[styles.body, { color: "#3B82F6" }]}>
                  {k}: {String(v)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.box}>
            <Text style={modalStyles.title}>Konfirmasi</Text>
            <Text style={modalStyles.message}>
              Apakah kamu yakin? Vote-mu tidak bisa diubah.
            </Text>

            <View style={modalStyles.buttonsRow}>
              <Pressable
                style={[modalStyles.btn, modalStyles.btnOutline]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={modalStyles.btnOutlineText}>Batal</Text>
              </Pressable>

              <Pressable
                style={[modalStyles.btn, modalStyles.btnPrimary]}
                onPress={handleVoteNow}
                disabled={voting}
              >
                <Text style={modalStyles.btnPrimaryText}>
                  {voting ? "Memilih..." : "Konfirmasi"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  headerImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 12,
  },

  /* Vote */
  voteNow: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  voteNowDisabled: {
    backgroundColor: "#9CA3AF",
  },
  voteNowText: {
    color: "#fff",
    fontWeight: "700",
  },
  voteNowTextDisabled: {
    color: "#E5E7EB",
  },

  /* Tabs */
  tabs: {
    flexDirection: "row",
    marginTop: 20,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#6D28D9",
  },
  tabText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#6D28D9",
  },

  /* Body */
  sectionHeader: {
    fontWeight: "700",
    marginTop: 16,
    fontSize: 15,
    color: "#111827",
  },
  muted: {
    color: "#6B7280",
    marginTop: 4,
  },
  body: {
    marginTop: 6,
    lineHeight: 20,
    color: "#374151",
  },
});

/* Modal */
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  box: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    color: "#4F46E5",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: "#6D28D9",
  },
  btnOutlineText: {
    color: "#6D28D9",
    fontWeight: "700",
  },
  btnPrimary: {
    backgroundColor: "#4F46E5",
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
